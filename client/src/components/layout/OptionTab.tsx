import styled from 'styled-components';
import Button from '../common/Button';
import { OptionType, CouponOption } from '../../common/types';

type PropsType = {
    optionMode: CouponOption;
    setOptionMode: React.Dispatch<React.SetStateAction<CouponOption>>;
};

const OptionTab = ({ optionMode, setOptionMode }: PropsType) => {
    const options: OptionType[] = [
        {
            mode: 'active',
            text: 'Active',
        },
        {
            mode: 'disabled',
            text: 'Disabled',
        },
    ];

    const handleClick = (mode: CouponOption) => {
        setOptionMode(mode);
    };

    return (
        <OptionWrapper>
            {options.map((option, idx) => {
                return (
                    <Button
                        key={idx}
                        content={option.text}
                        className={`small curve ${
                            optionMode === option.mode ? 'darkliver' : 'grey'
                        }`}
                        onClick={() => {
                            handleClick(option.mode);
                        }}
                    />
                );
            })}
        </OptionWrapper>
    );
};

const OptionWrapper = styled.div`
    display: flex;
    flex-direction: row;
    width: 200px;
    justify-content: space-around;
    align-items: center;
    margin-bottom: 16px;
`;

export default OptionTab;
