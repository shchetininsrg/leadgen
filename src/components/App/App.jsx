import React from 'react';
import Table from '../Table/Table.jsx';
import FilterTag from '../FilterTag/FilterTag.jsx';
import { useEffect, useState } from 'react';
import members from '../utils/members.js';
import cities from '../utils/cities.js';
import axios from 'axios';
import { apiToken, apiUrl } from '../utils/configApi.js';



function App() {
  const [selectedTag, setSelectedTag] = useState('')
  const [selectedProject, setSelectedProject] = useState('')

  async function getTasks() {
    try {
      let allTasks = [];
      const projectIds = [selectedTag]; // Ваши projectId
      const limit = 20; // Максимальное число задач за один запрос
      console.log(selectedTag);
      for (const projectId of projectIds) {
        let offset = 0; // Начальное смещение для каждого projectId
  
        while (true) {
          const response = await axios.get(
            `${apiUrl}/tm/tasks/?offset=${offset}&projectId=${projectId}&all=1`,
            {
              headers: {
                Authorization: `Bearer ${apiToken}`,
              },
            }
          );
  
          const tasks = response.data.tasks;
  
          allTasks = allTasks.concat(tasks); // Добавляем полученные задачи
  
          if (tasks.length < limit) {
            // Если задач меньше лимита, значит это последний запрос для этого projectId
            break;
          }
  
          offset += limit; // Увеличиваем смещение для следующего запроса
        }
      }

  
      return allTasks; // Возвращаем объединенные данные
    } catch (error) {
      console.error('Ошибка при получении данных:', error);
      return []; // Возвращаем пустой массив в случае ошибки
    }
  }

  function getUserName(userId) {
    const user = members.find((member) => member.userId === userId);
    return user ? user.name : 'Unknown';
  }
  
  function getTags(userId) {
    const user = members.find((member) => member.userId === userId);
    return user ? user.tags : 'Unknown';
  }
  
  function getCash(userId) {
    const user = members.find((member) => member.userId === userId);
    return user ? user.cash : 0;
  }


  const [aggregatedTasks, setAggregatedTasks] = useState([]);

  const filterTag = Number(selectedProject)
 
    const fetchAndProcessTasks = async () => {
      let tasks = await getTasks();
      console.log(selectedProject);
      let aggregatedTasks = tasks
        .filter((task) => task.tags.includes(filterTag))
        .reduce((acc, task) => {
          let userName = getUserName(task.userId);
          let userId = task.userId;
          let duration = 
            task.workloads.reduce(
              (sum, workload) => sum + (workload.duration || 0),
              0
            ) / 60
          ;

          let moreInfo = {
            title: task.title.match(/^[^\/|]+/)[0].trim(),
            tags: getTags(task.userId),
            duration,
          };

          // Проверяем, есть ли уже объект для текущего пользователя
          let existingUser = acc.find((user) => user.userName === userName);
          if (existingUser) {
            // Добавляем moreInfo в существующего пользователя
            existingUser.moreInfo.push(moreInfo);
          } else {
            // Создаем новый объект для пользователя
            acc.push({
              boardId: task.boardId,
              userName,
              userId,
              moreInfo: [moreInfo],
              totalDuration: 0,
              otherDuration: 0,
              costOtherDuration: 0,
            });
          }

          return acc;
        }, []);
      aggregatedTasks.forEach((user) => {
        user.totalDuration = user.moreInfo.reduce(
          (sum, info) => sum + info.duration,
          0
        );
        user.otherDuration = 159 - user.totalDuration;
        const totalWithMore = user.totalDuration + user.otherDuration;

        // Вычисляем долю для каждого title
        user.moreInfo.forEach((info) => {
          info.shareTotalTime = (info.duration / totalWithMore) * 100;
        });
        user.moreInfo.forEach((info) => {
          info.cost = 
            getCash(user.userId) * (info.shareTotalTime / 100)
        });
        user.costOtherDuration = 
          getCash(user.userId) * (user.otherDuration / totalWithMore)
      });

      // Подсчет общего cost
      const totalCost = aggregatedTasks.reduce((sum, user) => {
        return (
          user.costOtherDuration +
          sum +
          user.moreInfo.reduce((userSum, info) => userSum + (info.cost || 0), 0)
        );
      }, 0);

      // Рассчитываем долю для каждого title
      aggregatedTasks.forEach((user) => {
        user.moreInfo.forEach((info) => {
          info.shareTotalCost = info.cost / totalCost; // Доля в процентах
        });
      });

      const reportsCost = aggregatedTasks.reduce((sum, user) => {
        return (
          sum +
          user.moreInfo
            .filter((info) => info.title.includes('Заполнение отчетов'))
            .reduce((userSum, info) => userSum + (info.cost || 0), 0)
        );
      }, 0);

      aggregatedTasks.forEach((user) => {
        user.moreInfo.forEach((info) => {
          info.costAnalysis = info.shareTotalCost * reportsCost; // Формула для costAnalysis
        });
      });

      aggregatedTasks.forEach((user) => {
        user.moreInfo.forEach((info) => {
          info.finalCost = (info.costAnalysis + info.cost) * 1.8; // Формула для finalCost
        });
      });
      setAggregatedTasks(aggregatedTasks);
      console.log(JSON.stringify(aggregatedTasks, null, 2))
    };

  return (
    <div className='App'>
      <FilterTag selectedTag={selectedTag} setSelectedTag={setSelectedTag} selectedProject={selectedProject} setSelectedProject={setSelectedProject}/>
      <button onClick={fetchAndProcessTasks}>Загрузить/обновить</button>
      <Table data={aggregatedTasks}/>
    </div>
  );
}

export default App;
