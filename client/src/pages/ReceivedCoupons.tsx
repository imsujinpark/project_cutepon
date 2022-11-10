import { useState } from 'react';
import styled from 'styled-components';
import { CouponData, CouponOption } from '../common/types';
import Coupon from '../components/layout/Coupon';
import OptionTab from '../components/layout/OptionTab';
import Description from '../components/layout/Description';
import { faArrowPointer } from '@fortawesome/free-solid-svg-icons';

const ReceivedCoupons = () => {
    const [optionMode, setOptionMode] = useState<CouponOption>('active');

    const dummyData: CouponData[] = [
        {
            id: 1,
            origin: 'sujinparkova',
            title: 'Belly Buruburu Belly Burubr',
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
                'description of the coupon description of the coupon description of the coupon description of description of the coupon description of the coupon description of the coupon description of',
            receivedDate: 20202020,
            expirationDate: 20202020,
            status: 'active',
        },
        {
            id: 999,
            origin: 'sujinparkova',
            title: 'Belly Buruburu',
            description:
                'adaadfafadaadfafadaadfafadaadfafadaadfafadaadfafadaadfafadaadfafadaadfafadaadfafadaadfafadaadfafadaa',
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
            origin: 'sujinparkova',
            title: 'Belly Buruburu',
            description:
                'description of the coupon description of the coupon description of the coupon description of',
            receivedDate: 20202020,
            expirationDate: 20202020,
            status: 'expired',
        },
        {
            id: 5,
            origin: 'sujinparkova',
            title: 'Belly Buruburu',
            description: '',
            receivedDate: 20202020,
            expirationDate: 20202020,
            status: 'expired',
        },
    ];
    return (
        <Container>
            <h1>Received Coupons</h1>
            <OptionTab optionMode={optionMode} setOptionMode={setOptionMode} />
            {optionMode === 'active' ? (
                <Description
                    text="Click the coupon to redeem, delete, or send a copy"
                    icon={faArrowPointer}
                />
            ) : (
                <Description
                    text="Click the coupon to delete or send a copy"
                    icon={faArrowPointer}
                />
            )}
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
