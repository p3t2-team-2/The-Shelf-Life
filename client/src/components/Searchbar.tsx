import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// import ".Header/Header.css";

type SearchBarProps = {
    onSearch: (query: string) => void;
  }
  
  const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
    const [query, setQuery] = useState<string>("");
    const navigate = useNavigate();

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(event.target.value);
        // console.log(event.target.value);
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        console.log("Search query submitted:", query);
        // onSearch(query);
        // Call API
        if (query.trim()) {
          navigate(`/search?query=${query}`)
        }
    };

return (
    <form onSubmit={handleSubmit} className="search-bar">
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        placeholder="Search for recipes..."
        className="search-input"
      />
      <button className="search-button">
  <span className="search-full">Search</span>
  {/* <span className="search-short">S</span> */}
</button>
    </form>
  );
};

export default SearchBar;