import { createGlobalStyle } from "styled-components";
import "./style.css";

const GlobalStyle = createGlobalStyle`

    * {
        box-sizing: border-box;
        font-family: 'GmarketSansMedium';
    }

    body {
        overflow-x: hidden;
    }
    /* html,
    body {
        height: 100%;
        width: 100%;
        font-family: 'GmarketSansMedium';
    } */

    h1 {
        color: var(--liver-500);
        font-size: 16px;
        margin-bottom: 28px;
    }

    button {
        border: none;
        cursor: pointer;
        &:hover {
            box-shadow: var(--shadow-medium);
        }
    }

    li {
        text-decoration: none;
    }

    a {
        text-decoration: none;
    }
`;

export default GlobalStyle;
