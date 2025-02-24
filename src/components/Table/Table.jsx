import cities from '../utils/cities.js';
import React from 'react';

function Table({ data }) {
  return (
    <table className='table'>
      <thead className='table__head'>
        <tr>
          <th>Город</th>
          <th>Затраченное время</th>
        </tr>
      </thead>
      <tbody className='table__body'>
        {data.length === 0 ? (
          <tr>
            <td colSpan='3'></td>
          </tr>
        ) : (
          data
            .filter((item) => cities.some((city) => city.name === item.title)) // Фильтрация по городам
            .map((item, index) => (
              <tr key={index}>
                <td>{item.title}</td>
                <td>{item.duration.toFixed(0)}</td>
              </tr>
            ))
        )}
      </tbody>
    </table>
  );
}

export default Table;
