import React, { useState, useEffect } from "react";
import axios from "axios";
import { apiToken, apiUrl } from '../utils/configApi.js';

const place = [
    { id: 0, name: 'Выберите площадку'},
    { id: 36, name: 'Контекст'},
{id: 38, name: 'Таргет'}
]

function FilterTag({selectedTag, setSelectedTag, selectedProject, setSelectedProject})  {
    const [tags, setTags] = useState([]);

    async function getTags() {
        try {
            const response = await axios.get(`${apiUrl}/ws/tags`, {
                headers: {
                    Authorization: `Bearer ${apiToken}`,
                },
            });
            const fetchedTags = response.data.tags.reverse();
            return fetchedTags;
        } catch (error) {
            console.error("Ошибка при загрузке тегов:", error);
            return [];
        }
    }

    useEffect(() => {
        const fetchTags = async () => {
            const fetchedTags = await getTags();
            setTags(fetchedTags);
        };

        fetchTags();
    }, []);

    return (
        <div>
            {tags.length === 0 ? (
                <p>Загрузка тегов...</p>
            ) : (
                <select onChange={(e) => setSelectedProject(e.target.value)} value={selectedProject}>
                    <option value="">Выберите месяц</option>
                    {tags.map((tag) => (
                        <option key={tag.id} value={tag.id}>
                            {tag.title}
                        </option>
                    ))}
                </select>
            )}
            <select onChange={(e) => setSelectedTag(e.target.value)} value={selectedTag}>
                {place.map((place) => (
                    <option key={place.id} value={place.id}>
                        {place.name}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default FilterTag;
