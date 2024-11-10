    import React, { useState, forwardRef, useImperativeHandle } from 'react';
    import { Menu, MenuItem, IconButton } from '@mui/material';
    import { EllipsisOutlined } from '@ant-design/icons';
    import { toast } from 'react-toastify'; // Убедитесь, что импортировали toast из react-toastify
    import uploadToStorage from 'src/utils/uploadToFirebaseStorage';


    const SimpleDropdown = forwardRef((props, ref) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    // Открытие меню
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    // Закрытие меню
    const handleClose = () => {
        setAnchorEl(null);
    };

    // Делаем handleClick доступной для родителя через useImperativeHandle
    useImperativeHandle(ref, () => ({
        openMenu: (event) => {
        handleClick(event);
        },
        closeMenu: () => {
        handleClose();
        },
        shareFile: (file) => {
        handleShare(file);
        }
    }));

    const handleShare = async (file) => {
    try {
        if (props.file) {
            const { downloadURL } = await uploadToStorage(props.file);
            console.log("Ссылка для шаринга:", downloadURL);

            // Копируем ссылку в буфер обмена
            await navigator.clipboard.writeText(downloadURL);

            // Показать тост после успешного копирования
            toast.success("Ссылка успешно скопирована в буфер обмена!");

        } else {
            console.error("Файл не передан для шаринга");
        }
    } catch (error) {
        console.error("Ошибка при шаринге файла:", error);
        toast.error("Ошибка при попытке шаринга файла");
    }
    handleClose(); // Закрытие меню после выполнения действия
};

    return (
        <div>
        <IconButton
            aria-label="more"
            aria-controls={open ? 'basic-menu' : undefined}
            aria-haspopup="true"
            onClick={handleClick}
        >
            <EllipsisOutlined />
        </IconButton>

        <Menu
            id="basic-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            MenuListProps={{
            'aria-labelledby': 'basic-button',
            }}
        >
            <MenuItem onClick={handleShare}>Поделиться</MenuItem>
            <MenuItem onClick={handleClose}>Мои аккаунты</MenuItem>
            <MenuItem onClick={handleClose}>Выйти</MenuItem>
        </Menu>
        </div>
    );
    });

    export default SimpleDropdown;
