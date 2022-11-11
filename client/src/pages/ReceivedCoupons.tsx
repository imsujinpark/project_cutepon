import { useEffect, useState } from 'react';
import styled from 'styled-components';

import { CouponData, CouponOption } from '../common/types';
import Coupon from '../components/layout/Coupon';
import OptionTab from '../components/layout/OptionTab';
import Description from '../components/layout/Description';
import { faArrowPointer } from '@fortawesome/free-solid-svg-icons';

import axios from 'axios';

const ReceivedCoupons = () => {
    const [optionMode, setOptionMode] = useState<CouponOption>('active');
    const [couponData, setCouponData] = useState<CouponData[]>([]);

    useEffect(() => {
        getCoupons();
    }, []);

    const getCoupons = async () => {
        try {
            const { data } = await axios.get(`/api/available`);
            console.log(data);
            setCouponData(data);
        } catch (error) {
            console.log(error);
        }
    };

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
            {couponData.map((el, idx) => {
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
