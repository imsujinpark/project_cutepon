import React from "react";
import styled from "styled-components";
// font-awesome icon
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

interface SearchBarProps {
    keyword: string;
    setKeyword: React.Dispatch<React.SetStateAction<string>>;
}

const SearchBar = ({ keyword, setKeyword }: SearchBarProps) => {
    
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setKeyword(e.target.value);
	};

	const clearKeyword = () => {
		setKeyword("");
	};
    
	return (
		<Container>
			<Input value={keyword} onChange={handleChange} />
			<StyledFontAwesomeIcon icon={faXmark} onClick={clearKeyword}/>
		</Container>
	);
};

const Container = styled.div`
    width: 348px;
    height: 32px;
    border: 3px solid var(--primary-400);
	border-radius: 4px;
	margin-bottom: 16px;
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
`;

const Input = styled.input`
    width: 320px;
	border: none;
	margin: 0 4px;
	&:focus{
    	outline: none;
}
`;

const StyledFontAwesomeIcon = styled(FontAwesomeIcon)`
	color: var(--primary-400);
	margin-right: 8px;
	cursor: pointer;
	&:hover {
		color: var(--primary-500);
	}
	&:active {
		color: var(--primary-500);
		transform: translate(1px, 1px);
	}
`;

export default SearchBar;
