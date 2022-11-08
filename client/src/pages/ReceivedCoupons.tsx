import styled from 'styled-components';
import { CouponData } from '../common/types';
import Coupon from '../components/layout/Coupon';

const ReceivedCoupons = () => {
    const dummyData: CouponData[] = [
        {
            id: 1,
            origin: 'sujinparkova',
            title: 'Belly Buruburu',
            description: 'you can give buruburu on the belly for 3 seconds',
            receivedDate: 20202020,
            expirationDate: 20202020,
            status: 'active',
        },
        {
            id: 2,
            origin: 'sujinparkova',
            title: 'Belly Buruburu',
            description:
                'description of the coupon description of the coupon description of the coupon description of',
            receivedDate: 20202020,
            expirationDate: 20202020,
            status: 'active',
        },
        {
            id: 999,
            target: 'sujinparkova',
            title: 'Belly Buruburu',
            description:
                'description of the coupon description of the coupon description of the coupon description of',
            receivedDate: 20202020,
            expirationDate: 20202020,
            status: 'active',
        },
        {
            id: 3,
            origin: 'sujinparkova',
            title: 'Belly Buruburu',
            description: 'you can give buruburu on the belly for 3 seconds',
            receivedDate: 20202020,
            expirationDate: 20202020,
            status: 'expired',
        },
        {
            id: 4,
            target: 'sujinparkova',
            title: 'Belly Buruburu',
            description:
                'description of the coupon description of the coupon description of the coupon description of',
            receivedDate: 20202020,
            expirationDate: 20202020,
            status: 'expired',
        },
        {
            id: 5,
            target: 'sujinparkova',
            title: 'Belly Buruburu',
            description:
                'description of the coupon description of the coupon description of the coupon description of',
            receivedDate: 20202020,
            expirationDate: 20202020,
            status: 'expired',
        },
    ];
    return (
        <Container>
            <h1>Received Coupons</h1>
            {dummyData.map((el, idx) => {
                return <Coupon key={idx} data={el} />;
            })}
        </Container>
    );
};

const Container = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    padding: 8px 0;
`;

export default ReceivedCoupons;
