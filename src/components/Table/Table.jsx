import {citiesF1} from '../utils/cities.js';
import React, { useState } from "react";

function Table({ data }) {
  const [visibleGroups, setVisibleGroups] = useState({
    f1: false,
    f2: false,
    other: false,
  });

  const toggleVisibility = (userId, group) => {
    setVisibleGroups((prev) => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [group]: !prev[userId]?.[group],
      },
    }));
  };

  return (
    <div>
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
          data.map((item, index) => (
            <React.Fragment key={index}>
              {item.moreInfo
                .filter((moreInfoItem) =>
                  citiesF1.some((filter) => filter.name === moreInfoItem.title)
                ) // Фильтрация по соответствию имени
                .map((subItem, subIndex) => (
                  <tr key={subIndex}>
                    <td>{subItem.title}</td>
                    <td>{subItem.duration.toFixed(0)}</td>
                  </tr>
                ))}
            </React.Fragment>
          ))
        )}
      </tbody>
    </table>
        <div className='table-container'>
        {data.length === 0 ? (
      <p></p>
    ) : (
      data.map((item) => (
        <table className="table table-mini" key={item.userId}>
          <thead className="table__head">
            <tr>
              <th>{item.userName}</th>
              <th>Затраченное время</th>
              <th>Доля</th>
            </tr>
          </thead>
          <tbody>
            {/* Группа Ф1 */}
            <tr className='table_tr'>
              <td>
                <button onClick={() => toggleVisibility(item.userId, "f1")}>
                  {visibleGroups[item.userId]?.f1 ? "-" : "+"}
                </button>{" "}
                Ф1
              </td>
              <td></td>
              <td>{item.groupedMoreInfo.f1TotalShare.toFixed(0)}%</td>
            </tr>
            {visibleGroups[item.userId]?.f1 &&
              item.groupedMoreInfo.f1.map((subItem, subIndex) => (
                <tr key={`f1-${subIndex}`}>
                  <td>{subItem.title}</td>
                  <td>{subItem.duration.toFixed(0)}</td>
                  <td>{subItem.shareTotalTime.toFixed(0)}%</td>
                </tr>
              ))}

            {/* Группа Ф2 */}
            <tr className='table_tr'>
              <td>
                <button onClick={() => toggleVisibility(item.userId, "f2")}>
                  {visibleGroups[item.userId]?.f2 ? "-" : "+"}
                </button>{" "}
                Ф2
              </td>
              <td></td>
              <td>{item.groupedMoreInfo.f2TotalShare.toFixed(0)}%</td>
            </tr>
            {visibleGroups[item.userId]?.f2 &&
              item.groupedMoreInfo.f2.map((subItem, subIndex) => (
                <tr key={`f2-${subIndex}`}>
                  <td>{subItem.title}</td>
                  <td>{subItem.duration.toFixed(0)}</td>
                  <td>{subItem.shareTotalTime.toFixed(0)}%</td>
                </tr>
              ))}

            {/* Группа Остальное */}
            <tr className='table_tr'>
              <td>
                <button onClick={() => toggleVisibility(item.userId, "other")}>
                  {visibleGroups[item.userId]?.other ? "-" : "+"}
                </button>{" "}
                Остальное
              </td>
              <td></td>
              <td>{item.groupedMoreInfo.otherTotalShare.toFixed(0)}%</td>
            </tr>
            {visibleGroups[item.userId]?.other &&
              item.groupedMoreInfo.other.map((subItem, subIndex) => (
                <tr key={`other-${subIndex}`}>
                  <td>{subItem.title}</td>
                  <td>{subItem.duration.toFixed(0)}</td>
                  <td>{subItem.shareTotalTime.toFixed(0)}%</td>
                </tr>
              ))}
          </tbody>
        </table>
      ))
    )}
        </div>
    
</div>
  );
}

export default Table;
