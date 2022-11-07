import styled from 'styled-components';
import { CouponData } from '../../common/types';
import Button from '../common/Button';
import { useState, useRef, RefObject } from 'react';
import useDetectClickOutside from '../../hooks/useDetectClickOutside';

type UserProps = {
    data: CouponData;
};

const Coupon = ({ data }: UserProps) => {
    const {
        id,
        origin,
        target,
        title,
        description,
        receivedDate,
        expirationDate,
        status,
    } = data;

    const couponRef = useRef(null);
    const [isClicked, setIsClicked] = useDetectClickOutside(couponRef, false);

    const handleCouponClick = (): void => {
        setIsClicked(true);
    };

    const handleDelete = (): void => {
        console.log('deleted!');
        setIsClicked(false);
    };

    const handleSendCopy = (): void => {
        console.log('gonna go to new coupon page!');
        setIsClicked(false);
    };

    const handleRedeem = (): void => {
        console.log('redeemed!');
        setIsClicked(false);
    };

    return (
        <OuterContainer>
            <Container
                className={`${status} ${isClicked && 'blur'}`}
                onClick={handleCouponClick}
                ref={couponRef}
            >
                <InnerContainer>
                    <Head>
                        <h2>{title}</h2>
                        {/* from 정보가 있으면 받는 쿠폰으로 origin 표시, 없으면 보내는 쿠폰으로 to 표시 */}
                        {/* 추후 유저 정보에 따라 from 이 내 아이디인지 to가 내 아이디인지 확인 예정 */}
                        <span>
                            {origin !== undefined
                                ? `from. ${origin}`
                                : `to. ${target}`}
                        </span>
                    </Head>
                    <Body>{description}</Body>
                    <TailTop>{status}</TailTop>
                    <TailBottom>
                        <span>
                            #{receivedDate}-{id}
                        </span>
                        <span>Expiration D-2100</span>
                    </TailBottom>
                </InnerContainer>
            </Container>
            {isClicked && (
                <ButtonWrapper>
                    <Button
                        content="Delete"
                        className="grey"
                        onClick={handleDelete}
                    />
                    <Button
                        content="Send Copy"
                        className="lightpink"
                        onClick={handleSendCopy}
                    />
                    {status === 'active' && (
                        <Button
                            content="Redeem"
                            className="primary"
                            onClick={handleRedeem}
                        />
                    )}
                </ButtonWrapper>
            )}
        </OuterContainer>
    );
};

const OuterContainer = styled.div`
    width: 360px;
    height: 120px;
    margin-bottom: 8px;
`;
const Container = styled.div`
    cursor: pointer;
    width: 360px;
    height: 120px;
    border: 4px solid var(--primary-500);
    border-left: 20px solid var(--primary-500);
    background-color: var(--ecru-200);
    border-radius: 6px;

    :not(&.active) {
        background-color: var(--liver-050);
        border: 4px solid var(--liver-200);
        border-left: 20px solid var(--liver-200);
        // InnerContainer
        > div {
            border-left: 2px dashed var(--liver-200);
        }
        > div > * {
            color: var(--liver-300);
        }
    }

    &.blur {
        opacity: 40%;
    }
`;

const InnerContainer = styled.div`
    width: 336px;
    height: 112px;
    border-left: 2px dashed var(--primary-500);
    display: flex;
    flex-direction: column;
    color: var(--liver-600);
    padding: 8px 10px 8px 8px;
    > * {
        width: 318px;
    }
`;

const Head = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    // title
    > h2 {
        margin: 0;
        font-size: 14px;
        width: 218px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }
    // Sender/Receiver
    > span {
        font-size: 10px;
        width: 90px;
        text-align: right;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }
`;

const Body = styled.div`
    display: flex;
    height: 30px;
    font-size: 12px;
    overflow-wrap: break-word;
    margin-bottom: 12px;
    color: var(--liver-500);
`;

const TailTop = styled.div`
    font-size: 10px;
    font-weight: bold;
    display: flex;
    justify-content: flex-end;
    margin-bottom: 6px;
    color: var(--liver-500);
`;

const TailBottom = styled.div`
    font-size: 10px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    color: var(--liver-500);
    > span:first-of-type {
        color: var(--liver-300);
    }
`;

const ButtonWrapper = styled.div`
    position: relative;
    top: -120px;
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    z-index: 999;
    width: 360px;
    height: 120px;
    border-radius: 6px;
`;

export default Coupon;
