import React from 'react';
import Table from '../Table/Table.jsx';
import FilterTag from '../FilterTag/FilterTag.jsx';
import { useEffect, useState } from 'react';
import {citiesF1, citiesF2} from '../utils/cities.js'
import { members } from '../utils/members.js';
import axios from 'axios';
import { apiToken, apiUrl } from '../utils/configApi.js';

function App() {
  const [selectedTag, setSelectedTag] = useState();
  const [selectedProject, setSelectedProject] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function getTasks() {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  }

  const [aggregatedTasks, setAggregatedTasks] = useState([]);

  const filterTag = selectedProject;

  function getUserName(userId) {
    const user = members.find((member) => member.userId === userId);
    return user ? user.name : 'Unknown';
  }

  const fetchAndProcessTasks = async () => {
    let tasks = await getTasks();
  
    let aggregatedTasks = tasks
      .filter((task) => {
        return task.customFields?.some(
          (field) =>
            Array.isArray(field.value) && field.value.includes(filterTag)
        );
      })
      .reduce((acc, task) => {
        let userName = getUserName(task.userId);
        let duration = Math.round(
          task.workloads.reduce(
            (sum, workload) => sum + (workload.duration || 0),
            0
          ) / 60
        );
  
        let moreInfo = {
          title: task.title.match(/^[^\/|]+/)[0].trim(),
          duration,
        };
        let existingUser = acc.find((user) => user.userName === userName);
        if (existingUser) {
          // Добавляем moreInfo в существующего пользователя
          existingUser.moreInfo.push(moreInfo);
        } else {
          acc.push({
            userName,
            userId: task.userId,
            moreInfo: [moreInfo],
          });
        }
  
        return acc;
      }, []);
  
    // Рассчитываем totalDuration и shareTotalTime
    aggregatedTasks.forEach((user) => {
      user.totalDuration = user.moreInfo.reduce(
        (sum, info) => sum + info.duration,
        0
      );
      user.moreInfo.forEach((info) => {
        info.shareTotalTime = (info.duration / user.totalDuration) * 100;
      });
    });

  
    const groupedTasks = aggregatedTasks.map((user) => {
      const groupedMoreInfo = user.moreInfo.reduce(
        (acc, item) => {
          // Проверяем, есть ли город в массиве citiesF2
          const isF2City = citiesF2.some((city) => city.name === item.title);
          const isF1City = citiesF1.some((city) => city.name === item.title);
          if (isF2City) {
            acc.f2.push(item);
          } else if(isF1City) {
            acc.f1.push(item)
          } 
          
          else {
            acc.other.push(item);
          }
          return acc;
        },
        { f1: [], f2: [], other: [] }
      );
  
      // Считаем сумму shareTotalTime для каждой группы
      groupedMoreInfo.f2TotalShare = groupedMoreInfo.f2.reduce(
        (sum, item) => sum + item.shareTotalTime,
        0
      );
      groupedMoreInfo.f1TotalShare = groupedMoreInfo.f1.reduce(
        (sum, item) => sum + item.shareTotalTime,
        0
      );
      groupedMoreInfo.otherTotalShare = groupedMoreInfo.other.reduce(
        (sum, item) => sum + item.shareTotalTime,
        0
      );
  
      return {
        ...user,
        groupedMoreInfo, // Добавляем сгруппированные данные
      };
    });
  
    setAggregatedTasks(groupedTasks);
    console.log(JSON.stringify(groupedTasks, null, 2));
  };

  return (
    <div className='App'>
      <FilterTag
        selectedTag={selectedTag}
        setSelectedTag={setSelectedTag}
        selectedProject={selectedProject}
        setSelectedProject={setSelectedProject}
      />
      <div>{isLoading && <p>Запрос выполняется...</p>}</div>
      <button onClick={fetchAndProcessTasks}>Загрузить/обновить</button>
      <Table data={aggregatedTasks} />
    </div>
  );
}

export default App;
