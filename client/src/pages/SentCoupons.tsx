import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import { CouponData } from '../common/types';
import Coupon from '../components/layout/Coupon';
import OptionTab from '../components/layout/OptionTab';
import Description from '../components/layout/Description';
import { faArrowPointer } from '@fortawesome/free-solid-svg-icons';

import axios from 'axios';

const SentCoupons = () => {
    const [couponData, setCouponData] = useState<CouponData[]>([]);
    const [activeCoupons, setActiveCoupons] = useState<CouponData[]>([]);
    const [disabledCoupons, setDisabledCoupons] = useState<CouponData[]>([]);

    // status is either "active" or "disabled"
    const { status } = useParams();

    useEffect(() => {
        getCoupons();
    }, []);

    // filters server coupon data by status
    useEffect(() => {
        if (status === 'active') {
            const filteredArr = couponData.filter((data) => data.status === 0);
            setActiveCoupons([...filteredArr]);
        } else {
            const filteredArr = couponData.filter((data) => data.status !== 0);
            setDisabledCoupons([...filteredArr]);
        }
    }, [status, couponData]);

    const getCoupons = async () => {
        try {
            const { data } = await axios.get(`/api/sent`);
            console.log(data);
            setCouponData(data);
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

    return (
        <Container>
            <h1>Sent Coupons</h1>
            <OptionTab />
            {status === 'active' ? (
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
            {status === 'active'
                ? activeCoupons.map((el, idx) => {
                      return <Coupon key={idx} data={el} mode="sent" />;
                  })
                : disabledCoupons.map((el, idx) => {
                      return <Coupon key={idx} data={el} mode="sent" />;
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

export default SentCoupons;
