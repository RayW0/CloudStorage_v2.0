// src/components/adminPanel/GroupsList.jsx
import React from 'react';
import { List, ListItem, ListItemText, IconButton, Typography, Collapse, ListItemSecondaryAction, Divider } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import PropTypes from 'prop-types';
import { useState } from 'react';

const GroupsList = ({ groups, handleDeleteGroup, handleRemoveUserFromGroup, users }) => {
  const [openGroupIds, setOpenGroupIds] = useState([]);

  const toggleGroup = (groupId) => {
    setOpenGroupIds((prevOpen) => (prevOpen.includes(groupId) ? prevOpen.filter((id) => id !== groupId) : [...prevOpen, groupId]));
  };

  console.log('groups:', groups); // Для отладки

  return (
    <div>
      <Typography variant="h6" gutterBottom>
        Список групп
      </Typography>
      <List>
        {Array.isArray(groups) &&
          groups.map((group) => (
            <React.Fragment key={group.id}>
              <ListItem button onClick={() => toggleGroup(group.id)}>
                <ListItemText primary={group.name} secondary={`Участники: ${Array.isArray(group.members) ? group.members.length : 0}`} />
                <ListItemSecondaryAction>
                  <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteGroup(group.id)}>
                    <DeleteIcon />
                  </IconButton>
                  <IconButton edge="end" aria-label="expand" onClick={() => toggleGroup(group.id)}>
                    {openGroupIds.includes(group.id) ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
              <Collapse in={openGroupIds.includes(group.id)} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {Array.isArray(group.members) &&
                    group.members.map((memberId) => {
                      const user = users.find((u) => u.uid === memberId);
                      return (
                        <ListItem key={memberId} sx={{ pl: 4 }}>
                          <ListItemText primary={user ? user.displayName : 'Неизвестный пользователь'} />
                          <IconButton edge="end" aria-label="remove" onClick={() => handleRemoveUserFromGroup(group.id, memberId)}>
                            <RemoveCircleOutlineIcon color="error" />
                          </IconButton>
                        </ListItem>
                      );
                    })}
                </List>
              </Collapse>
              <Divider />
            </React.Fragment>
          ))}
      </List>
    </div>
  );
};

GroupsList.propTypes = {
  groups: PropTypes.array.isRequired,
  handleDeleteGroup: PropTypes.func.isRequired,
  handleRemoveUserFromGroup: PropTypes.func.isRequired,
  users: PropTypes.array.isRequired
};

export default GroupsList;
