import cities from '../utils/cities.js';
import React from 'react';

function Table({data}) {
  

  return (
    <table className='table'>
      <thead className='table__head'>
        <tr>
          <th>Город</th>
          <th>Затраченное время</th>
          <th>Стоимость услуг</th>
        </tr>
      </thead>
      <tbody className="table__body">
  {data.length === 0 ? (
    <tr>
      <td colSpan="3"></td>
    </tr>
  ) : (
    data.map((item, index) => (
      <React.Fragment key={index}>
        {item.moreInfo
          .filter((moreInfoItem) =>
            cities.some((filter) => filter.name === moreInfoItem.title)
          ) // Фильтрация по соответствию имени
          .map((filteredItem, subIndex) => (
            <tr key={subIndex}>
              <td>{filteredItem.title}</td>
              <td>{filteredItem.duration.toFixed(0)}</td>
              <td>{filteredItem.finalCost.toFixed(0)}</td>
            </tr>
          ))}
      </React.Fragment>
    ))
  )}
</tbody>
    </table>
  );
}

export default Table;
