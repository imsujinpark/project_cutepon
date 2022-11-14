import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// redux related
import { useDispatch } from 'react-redux';
import { logoutFulfilled } from '../features/userSlice';
import { persistor } from '../index';
import { setNoticeToast, setWarningToast } from '../features/toastSlice';

const Logout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // purge function is to remove state from session storage
    const purge = async () => {
        await persistor.purge();
    };

    useEffect(() => {
        logout();
    }, []);

    const logout = () => {
        dispatch(logoutFulfilled()); // changes login state in redux slice
        setTimeout(() => purge(), 1000); // will remove login info from session storage
        dispatch(setNoticeToast('Successfully logged out'));
        // window.location.reload(); // refresh to remove remaining silent refresh function timeout
        navigate('/');
    };

    return <div>Logging out...</div>;
};

export default Logout;
