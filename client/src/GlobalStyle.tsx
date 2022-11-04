import { createGlobalStyle } from 'styled-components';
import './style.css';

const GlobalStyle = createGlobalStyle`

    * {
        box-sizing: border-box;
        font-family: 'GmarketSansMedium';
        color: var(--black);
    }

    
    /* html,
    body {
        height: 100%;
        width: 100%;
        font-family: 'GmarketSansMedium';
    } */

    button {
        border: none;
        cursor: pointer;
    }
`;

export default GlobalStyle;
