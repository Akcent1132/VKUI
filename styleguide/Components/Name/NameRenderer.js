import React from 'react';
import { classNames, Text } from '@vkui';
import './Name.css';

export const NameRenderer = ({ children, deprecated }) => {
  return (
    <Text weight="regular" className={classNames('Name', { 'Name--deprecated': deprecated })}>{children}</Text>
  );
};

export default NameRenderer;
