import styled from 'styled-components';
// redux related
import { useDispatch, useSelector } from 'react-redux';
import { logoutFulfilled } from '../features/userSlice';
import { RootState } from '../store';
import { persistor } from '../index';
import axios from 'axios';
import { silentRefresh } from '../common/utils';

const Home = () => {
    const dispatch = useDispatch();

    // purge function to remove state from session storage
    const purge = async () => {
        await persistor.purge();
    };

    const logout = () => {
        dispatch(logoutFulfilled());
        setTimeout(() => purge(), 2000);
        window.location.reload();
    };

    const hello = async () => {
        try {
            const { data } = await axios.get(`/api/hello`);
            console.log(data);
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <Container>
            <div>Home</div>
            <button onClick={logout}>Logout</button>
            <button onClick={hello}>Hello</button>
            <button onClick={() => silentRefresh('111')}>REFRESH</button>
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
