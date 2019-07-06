import React, { useState } from 'react';
import Fab from '@material-ui/core/Fab';
import FilterList from '@material-ui/icons/FilterList';

const Filters = props => {

  return (
    <div id='fab'>
      <Fab color="primary" aria-label="Add" >
        <FilterList />
      </Fab>
    </div>
  )
}
export default Filters;