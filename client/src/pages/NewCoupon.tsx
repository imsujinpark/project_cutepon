import { useState } from 'react';
import styled from 'styled-components';
import { useForm, SubmitHandler, useWatch, Control } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Button from '../components/common/Button';

const schema = yup.object().shape({
    target: yup
        .string()
        .email('invalid email format')
        .required('receiver cannot be empty'),
    title: yup
        .string()
        .min(1)
        .max(27, 'title cannot be over 27 characters')
        .required('title cannot be empty'),
    description: yup.string().max(100, 'title cannot be over 92 characters'),
    expiration: yup.date().required(),
});

type FormValues = {
    target: string;
    title: string;
    description: string;
    expiration: string;
};

// creating styled-components outside function IsolateReRenderTitle & IsolateReRenderDescription will resolve below warning
// "The component styled.div with the id of "sc-fzqAui" has been created dynamically."
const Div = styled.div`
    font-size: 12px;
    text-align: end;
    color: var(--liver-400);
`;

// Character Counter for Title
function IsolateReRenderTitle({ control }: { control: Control<FormValues> }) {
    const title = useWatch({
        control,
        name: 'title',
        defaultValue: '',
    });

    return <Div>{title.length}/27</Div>;
}

// Character Counter for Description
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
    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isValid },
    } = useForm<FormValues>({
        resolver: yupResolver(schema),
    });

    const submitForm: SubmitHandler<FormValues> = (data) => {
        // will be replaced by an actual http request
        console.log(data);
    };
    return (
        <Container>
            <h1>Send New Coupon</h1>
            <Form onSubmit={handleSubmit(submitForm)}>
                <Label htmlFor="target">To *</Label>
                <Input
                    type="text"
                    id="target"
                    placeholder="email@gmail.com"
                    {...register('target')}
                />
                <ErrorMessage>{errors.target?.message}</ErrorMessage>

                <Label htmlFor="title">Title *</Label>
                <Input type="text" id="title" {...register('title')} />
                <IsolateReRenderTitle control={control} />
                <ErrorMessage className="title">
                    {errors.title?.message}
                </ErrorMessage>

                <Label htmlFor="description">Description</Label>
                <TextArea id="description" {...register('description')} />
                <IsolateReRenderDescription control={control} />
                <ErrorMessage>{errors.description?.message}</ErrorMessage>

                <Label htmlFor="expiration">Expiration Date *</Label>
                <Input
                    type="date"
                    id="expiration"
                    {...register('expiration')}
                    className="date"
                />
                <ErrorMessage>
                    {errors.expiration?.message && 'invalid date format'}
                </ErrorMessage>

                <ButtonWrapper>
                    <Button
                        content="CANCEL"
                        className="grey"
                        onClick={(e) => {
                            e.preventDefault();
                            console.log('cancelled????');
                        }}
                    />
                    <Button
                        content="SUBMIT"
                        className="primary"
                        // className={`primary ${!isValid && 'invalid'}`}
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
