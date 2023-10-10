import React, { useState } from 'react';

export const InputFieldForm = ({onNewInput, nameInput, typeInput}) => {
    const [value, setValue] = useState("");

    const onChangeInputValue = ({target}) => {
        const valueChange = target.value;
        setValue(valueChange);
        onNewInput(valueChange);
    }

    return (
        <input
            onChange={onChangeInputValue}
            value={value}
            type={typeInput}
            name={nameInput}
            className="form-control"
        />
    )
}
