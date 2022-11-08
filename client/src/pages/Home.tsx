import styled from 'styled-components';

const Home = () => {
    return (
        <Container>
            <div>home</div>
        </Container>
    );
};

const Container = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    padding: 8px 0;
    overflow-y: scroll;
`;

export default Home;
