import React, { useEffect, useState } from 'react';
import GuideCard from './GuideCard'; // your component

const Decision = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                const response = await fetch(
                    'https://testgcctaxlaws.com/api/v1/decisions/search?country=UAE&lawShortName=cit-fdl-47-2022&page=1&pageSize=10'
                );
                const data = await response.json();
                setArticles(data?.results || []); // adapt based on response structure
            } catch (error) {
                console.error('Error fetching articles:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchArticles();
    }, []);

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            {articles.map((article, index) => (
                <GuideCard
                    key={article.id || index}
                    article={article}
                    searchQuery={'cit-fdl-47-2022'} // optional
                />
            ))}
        </div>
    );
};

export default Decision;