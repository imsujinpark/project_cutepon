import React from "react";
import styled from "styled-components";

interface SearchBarProps {
    keyword: string;
    setKeyword: React.Dispatch<React.SetStateAction<string>>;
}

const SearchBar = ({ keyword, setKeyword }: SearchBarProps) => {
    
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setKeyword(e.target.value);
	};
    
	return (
		<div>
			<Input value={keyword} onChange={handleChange} />
		</div>
	);
};

const Input = styled.input`
    width: 348px;
    height: 32px;
    border: 3px solid var(--primary-400);
    border-radius: 4px;
    margin-bottom: 16px;
`;

export default SearchBar;
