import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { apiToken, apiUrl } from '../utils/configApi.js';
import './FilterTag.css';

const place = [
  { id: 36, name: 'Контекст' },
  { id: 38, name: 'Таргет' },
];

function FilterTag({
  selectedTag,
  setSelectedTag,
  selectedProject,
  setSelectedProject,
}) {
  const [customFields, setCustomFields] = useState([]);

  function getCustomFields(selectedTag) {
    return axios
      .get(`${apiUrl}/tm/projects/${selectedTag}`, {
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
      })
      .then((response) => {
        const customFields = response.data.project.customFields;

        // Фильтруем customFields по id
        const filteredCustomFields = customFields.filter(
          (item) =>
            item.id === '9e1ee38e-c54e-44dc-a6be-cf7e7e0b5405' ||
            item.id === '9e14e8b6-6b80-495a-9961-dc83446c13fd'
        );

        // Извлекаем options из отфильтрованных customFields
        const optionsArray = [];
        filteredCustomFields.forEach((field) => {
          if (field.options && field.options.length > 0) {
            optionsArray.push(...field.options); // Добавляем все options в массив
          }
        });

        // Выводим options в консоль для проверки
        console.log('Options:', JSON.stringify(optionsArray, null, 2));

        // Сохраняем options в состояние (если используется React)
        setCustomFields(optionsArray);

        // Возвращаем options для дальнейшей работы
        return optionsArray;
      })
      .catch((error) => {
        console.error('Ошибка при загрузке тегов:', error);
        return [];
      });
  }

  return (
    <div className='filter'>
      <select
        onInput={(e) => {
          setSelectedTag(e.target.value);
          getCustomFields(e.target.value);
        }}
        value={selectedTag}
      >
        <option value=''>Выбери площадку</option>
        {place.map((place) => (
          <option key={place.id} value={place.id}>
            {place.name}
          </option>
        ))}
      </select>

      {customFields.length === 0 ? (
        <p className='filter__text'>Сначала выбери площадку</p>
      ) : (
        <select
          onChange={(e) => setSelectedProject(e.target.value)}
          value={selectedProject}
        >
          <option value=''>Выберите месяц</option>
          {customFields.map((customField) => (
            <option key={customField.id} value={customField.id}>
              {customField.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

export default FilterTag;
