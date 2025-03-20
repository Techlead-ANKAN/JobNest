import React from 'react';
import styled from 'styled-components';

const CheckBox = ({ checked, onChange }) => {
  return (
    <StyledWrapper>
      <label htmlFor="checkboxInput" className="bookmark">
        <input 
          type="checkbox" 
          id="checkboxInput" 
          checked={checked}
          onChange={onChange}
        />
        <svg width={15} viewBox="0 0 50 70" fill="none" xmlns="http://www.w3.org/2000/svg" className="svgIcon">
          <path d="M46 62.0085L46 3.88139L3.99609 3.88139L3.99609 62.0085L24.5 45.5L46 62.0085Z" stroke="black" strokeWidth={7} />
        </svg>
      </label>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  #checkboxInput {
    display: none;
  }
  .bookmark {
    cursor: pointer;
    background-color: teal;
    width: 45px;
    height: 45px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
  }
  .svgIcon path {
    stroke-dasharray: 200 0;
    stroke-dashoffset: 0;
    stroke: white;
    fill: #dddddd00;
    transition-delay: 0s;
    transition-duration: 0.5s;
  }

  #checkboxInput:checked ~ .svgIcon path {
    fill: white;
    animation: bookmark 0.5s linear;
    transition-delay: 0.5s;
  }

  @keyframes bookmark {
    0% {
      stroke-dasharray: 0 200;
      stroke-dashoffset: 80;
    }
    100% {
      stroke-dasharray: 200 0;
    }
  }`;

export default CheckBox;
