import React from "react";
import { Outlet } from 'react-router-dom';

const CandidatesLayout = () => {
  return (
    <div className="p-4">
      <Outlet />
    </div>
  );
};

export default CandidatesLayout;