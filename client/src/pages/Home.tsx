import styled from 'styled-components';
import axios from 'axios';
import { silentRefresh } from '../common/utils';
// redux related
import { useDispatch, useSelector } from 'react-redux';
import { logoutFulfilled } from '../features/userSlice';
import { persistor } from '../index';
import { setNoticeToast, setWarningToast } from '../features/toastSlice';

const Home = () => {
    const dispatch = useDispatch();

    const hello = async () => {
        try {
            const { data } = await axios.get(`/api/hello`);
            dispatch(setNoticeToast(data));
            console.log(data);
        } catch (error: any) {
            if (
                error.response.data.message &&
                error.response.data.error !== undefined
            ) {
                // const err: Errors = error.response.data.error;
                // switch(err) {
                //     case Errors.AuthorizationExpired: {

                //     }
                // }
                console.log(`${error.response.data.message}`);
            } else {
                console.log(error);
            }
        }
    };

    const toastTest = () => {
        dispatch(setNoticeToast('does it work?'));
    };
    const toastTest2 = () => {
        dispatch(setWarningToast('it doesnt work'));
    };

    return (
        <Container>
            <div>Home</div>
            <button onClick={hello}>Who am I?</button>
            <button onClick={toastTest}>notice toaster</button>
            <button onClick={toastTest2}>warning toaster</button>
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
