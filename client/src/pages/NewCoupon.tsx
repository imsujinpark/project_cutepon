import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';

import { ConvertedFormValues, FormValues } from '../common/types';
import Button from '../components/common/Button';
import { nowToYYYYMMDD } from '../common/utils';

// redux related
import { useDispatch, useSelector } from 'react-redux';
import { clearCopyCoupon } from '../features/copyCouponSlice';
import { setNoticeToast } from '../features/toastSlice';
// react-hook-form & yup related
import { useForm, SubmitHandler, useWatch, Control } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { RootState } from '../store';

// schema has the properties that are going to be in the database.
const schema = yup.object().shape({
    target_user: yup
        .string()
        .email('invalid email format')
        .required('receiver cannot be empty'),
    title: yup
        .string()
        .min(1)
        .max(27, 'title cannot be over 27 characters')
        .required('title cannot be empty'),
    description: yup.string().max(100, 'title cannot be over 92 characters'),
    expiration_date: yup.string().required(),
});

// creating styled-components outside function IsolateReRenderTitle & IsolateReRenderDescription will resolve below warning
// "The component styled.div with the id of "sc-fzqAui" has been created dynamically."
const Div = styled.div`
    font-size: 12px;
    text-align: end;
    color: var(--liver-400);
`;

// character counter for Title
function IsolateReRenderTitle({ control }: { control: Control<FormValues> }) {
    const title = useWatch({
        control,
        name: 'title',
        defaultValue: '',
    });

    return <Div>{title.length}/27</Div>;
}

// character counter for Description
function IsolateReRenderDescription({
    control,
}: {
    control: Control<FormValues>;
}) {
    const description = useWatch({
        control,
        name: 'description',
        defaultValue: '',
    });

    return <Div>{description.length}/100</Div>;
}

const NewCoupon = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        return () => {
            // clears copy state
            dispatch(clearCopyCoupon());
        };
    }, []);

    // state of input data when coupon has been copied
    const { target_user, title, description, expiration_date } = useSelector(
        (state: RootState) => {
            return state.copyCoupon;
        }
    );

    // useForm from react-hook-form
    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isValid },
    } = useForm<FormValues>({
        resolver: yupResolver(schema),
    });

    // when submit button is valid and clicked
    const submitForm: SubmitHandler<FormValues> = async (formData) => {
        // change expiration date: string -> Date -> change time to 23:59 local (number)
        const stringToDate = new Date(formData.expiration_date);
        const dateToMidnightNum = stringToDate.setHours(23, 59, 59, 999);

        const payload: ConvertedFormValues = {
            title: formData.title,
            target_user: formData.target_user,
            description: formData.description,
            expiration_date: dateToMidnightNum,
        };

        console.log(payload);

        try {
            const response = await axios.post(`/api/send`, payload);
            console.log(response);
            dispatch(setNoticeToast('Successfully sent'));
            navigate('/sent/active');
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

    const handleCancel = (e: React.MouseEvent<HTMLElement>): void => {
        e.preventDefault();
        navigate(-1);
    };

    return (
        <Container>
            <h1>Send New Coupon</h1>
            <Form onSubmit={handleSubmit(submitForm)}>
                <Label htmlFor="target_user">To *</Label>
                <Input
                    type="text"
                    id="target_user"
                    placeholder="email@gmail.com"
                    {...register('target_user', {
                        value: target_user,
                    })}
                />
                <ErrorMessage>{errors.target_user?.message}</ErrorMessage>

                <Label htmlFor="title">Title *</Label>
                <Input
                    type="text"
                    id="title"
                    {...register('title', { value: title })}
                />
                <IsolateReRenderTitle control={control} />
                <ErrorMessage className="title">
                    {errors.title?.message}
                </ErrorMessage>

                <Label htmlFor="description">Description</Label>
                <TextArea
                    id="description"
                    {...register('description', { value: description })}
                />
                <IsolateReRenderDescription control={control} />
                <ErrorMessage>{errors.description?.message}</ErrorMessage>

                <Label htmlFor="expiration_date">Expiration Date *</Label>
                <Input
                    type="date"
                    id="expiration_date"
                    {...register('expiration_date', {
                        value: expiration_date,
                    })}
                    className="date"
                    // cannot set expiration to past
                    min={nowToYYYYMMDD()}
                />
                <ErrorMessage>
                    {errors.expiration_date?.message && 'invalid date format'}
                </ErrorMessage>

                <ButtonWrapper>
                    <Button
                        content="CANCEL"
                        className="grey"
                        onClick={handleCancel}
                    />
                    <Button
                        content="SUBMIT"
                        className={`primary ${!isValid && 'invalid'}`}
                        // if the button is actually invalid, it won't let the error message appear, so it is only made visually-invalid
                        // disabled={!isValid}
                    />
                </ButtonWrapper>
            </Form>
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

const Form = styled.form`
    display: flex;
    flex-direction: column;
    max-width: 98vw;
    width: 320px;
`;

const Label = styled.label`
    font-size: 14px;
    margin-bottom: 8px;
    color: var(--primary-600);
`;

const Input = styled.input`
    width: 100%;
    height: 30px;
    border: none;
    border-radius: 0; // prevent safari giving default radius
    border-bottom: 2px solid var(--liver-800);
    background-color: var(--lightpink-300);
    color: var(--liver-500);
    &.date {
        width: 320px;
    }
`;

const TextArea = styled.textarea`
    resize: none;
    border: none;
    width: 100%;
    height: 60px;
    border-radius: 0; // prevent safari giving default radius
    border-bottom: 2px solid var(--liver-800);
    background-color: var(--lightpink-300);
    color: var(--liver-500);
`;

const ErrorMessage = styled.span`
    font-size: 12px;
    margin: 4px 0 20px 0;
    color: var(--liver-400);
    // to remove the gap between character counter and error message
    &.title {
        margin-top: -8px;
    }
`;

const ButtonWrapper = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-around;
    margin-top: 24px;
`;

export default NewCoupon;
