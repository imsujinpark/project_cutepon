import styled from 'styled-components';

const Home = () => {
    return (
        <Container>
            <div>Home</div>
        </Container>
    );
};

const Container = styled.div`
    width: 100%;
    padding: 48px 0 0 0;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
`;

export default Home;
