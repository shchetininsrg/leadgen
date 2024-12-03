const axios = require("axios");

const apiToken = "a90da6b0-473c-4a06-93fb-6e236fb11f75";
const apiUrl = "https://api.weeek.net/v1"; // Убедитесь, что этот URL соответствует API-документации Weeek

// Функция для получения списка задач
async function getTasks() {
  try {
    const response = await axios.get(`${apiUrl}/tasks`, {
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
    });

    const tasks = response.data;

    // Пример обработки задач
    const taskDetails = tasks.map((task) => ({
      taskName: task.name,
      assigneeName: task.assignee ? task.assignee.name : "Не назначено", // имя исполнителя
      tags: task.tags
        ? task.tags.map((tag) => tag.name).join(", ")
        : "Нет тегов", // название тегов
      timeSpent: task.timeSpent || 0, // потраченное время
    }));

    console.log(taskDetails);
  } catch (error) {
    console.error("Ошибка при получении данных:", error);
  }
}

getTasks();
