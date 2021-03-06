// https://systemuicons.com/

import * as React from "react";

export const Dismiss = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
};

export const Moon = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
  );
};

export const ChevronDown = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
};

export const BLS = (props) => {
  return (
    <svg {...props} viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
      <g
        fill="none"
        fillRule="evenodd"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        transform="translate(2 4)"
      >
        <path d="m13.5 0 3 4-8 10-8-10 3.009-4z" />
        <path d="m.5 4h16" />
        <path d="m5.5 4 3 10" />
        <path d="m11.5 4-3 10" />
        <path d="m3.509 0 1.991 4 3-4 3 4 2-4" />
      </g>
    </svg>
  );
};

export const MULTISIG = (props) => {
  return (
    <svg {...props} viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
      <g
        fill="none"
        fillRule="evenodd"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="7.5" cy="10.5" r="5" />
        <circle cx="13.5" cy="10.5" r="5" />
      </g>
    </svg>
  );
};

export const SECP = (props) => {
  return (
    <svg {...props} viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
      <g
        fill="none"
        fillRule="evenodd"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        transform="translate(1 3)"
      >
        <path d="m17.5 8.5v3c0 1.2994935-3.1340068 3-7 3-3.86599325 0-7-1.7005065-7-3 0-.4275221 0-1.2608554 0-2.5" />
        <path d="m3.79385803 9.25873308c.86480173 1.14823502 3.53999333 2.22489962 6.70614197 2.22489962 3.8659932 0 7-1.60524016 7-2.98595204 0-.77476061-.9867994-1.62391104-2.5360034-2.22001882" />
        <path d="m14.5 3.5v3c0 1.29949353-3.1340068 3-7 3-3.86599325 0-7-1.70050647-7-3 0-.64128315 0-2.35871685 0-3" />
        <path d="m7.5 6.48363266c3.8659932 0 7-1.60524012 7-2.985952 0-1.38071187-3.1340068-2.99768066-7-2.99768066-3.86599325 0-7 1.61696879-7 2.99768066 0 1.38071188 3.13400675 2.985952 7 2.985952z" />
      </g>
    </svg>
  );
};
