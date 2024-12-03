const axios = require('axios');

const apiToken = 'f216f48f-a1f1-47c9-bb3f-7c05fb85c3ec';
const apiUrl = 'https://api.weeek.net/public/v1';

// Функция для получения списка задач
async function getTasks() {
  try {
    let allTasks = [];
    const projectIds = [38]; // Ваши projectId
    const limit = 20; // Максимальное число задач за один запрос

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

// Основная функция
(async () => {
  let tasks = await getTasks();

  // Фильтруем и агрегируем данные
  let aggregatedTasks = tasks
    .filter((task) => task.tags.includes(68))
    .reduce((acc, task) => {
      let userName = getUserName(task.userId);
      let userId = task.userId;
      let duration = Math.round(
        task.workloads.reduce(
          (sum, workload) => sum + (workload.duration || 0),
          0
        ) / 60
      );

      let moreInfo = {
        title: task.title.match(/^[^\/]+/)[0].trim(),
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
      info.cost = Math.round(
        getCash(user.userId) * (info.shareTotalTime / 100)
      );
    });
    user.costOtherDuration = Math.round(
      getCash(user.userId) * (user.otherDuration / totalWithMore)
    );
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

  console.log("Total Cost for 'Заполнение отчетов':", reportsCost);

  console.log('Total Cost:', totalCost);
  console.log(JSON.stringify(aggregatedTasks, null, 2));
})();
