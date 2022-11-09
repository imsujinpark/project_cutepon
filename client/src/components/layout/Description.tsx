import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styled from 'styled-components';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

type Type = {
    text: string;
    icon?: IconProp;
};

// a component where you can add a line of text and optional icon
const Description = ({ text, icon }: Type) => {
    return (
        <Container>
            {icon && <StyledFontAwesomeIcon icon={icon} />}
            <span>{text}</span>
        </Container>
    );
};

const Container = styled.div`
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 16px;
    > span {
        font-size: 12px;
        color: var(--primary-600);
        font-style: italic;
    }
`;
const StyledFontAwesomeIcon = styled(FontAwesomeIcon)`
    font-size: 12px;
    color: var(--primary-600);
    margin-right: 8px;
`;

export default Description;
