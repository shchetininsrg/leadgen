import React from 'react';
import Table from '../Table/Table.jsx';
import FilterTag from '../FilterTag/FilterTag.jsx';
import { useEffect, useState } from 'react';
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
        acc.push({
          duration:
            task.workloads.reduce(
              (sum, workload) => sum + (workload.duration || 0),
              0
            ) / 60,
          title: task.title.match(/^[^\/|]+/)[0].trim(),
        });

        return acc;
      }, []);
    setAggregatedTasks(aggregatedTasks);
    console.log(JSON.stringify(aggregatedTasks, null, 2));
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
