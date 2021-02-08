import * as React from "react";

import { FilecoinNumber, Converter } from "@glif/filecoin-number";

const WALLET_ADDRESS_TYPES_SVG = {
  1: "◈",
  2: "⁂",
  3: "✢",
};

export function formatAsFilecoinConversion(number) {
  const filecoinNumber = new FilecoinNumber(`${number}`, "attofil");
  const inFil = filecoinNumber.toFil();
  return `${formatAsFilecoin(inFil)}`;
}

export const debounce = (func, wait) => {
  let timeout;

  return function passedInFunction(...args) {
    const later = () => {
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export function formatAsFilecoin(number) {
  return `${number} FIL`;
}

export function getAlias(address, accounts, isElement = false) {
  if (!accounts) {
    return address;
  }

  if (accounts.addresses) {
    for (const a of accounts.addresses) {
      if (a.address === address) {
        const resolution = isEmpty(a.alias) ? address : a.alias;
        if (isElement) {
          return (
            <strong className="transactions-tag transactions-tag--yours">
              {WALLET_ADDRESS_TYPES_SVG[a.type]} {resolution}
            </strong>
          );
        }

        return resolution;
      }
    }
  }

  if (accounts.contacts) {
    for (const c of accounts.contacts) {
      if (c.address === address) {
        const resolution = isEmpty(c.alias) ? address : c.alias;
        if (isElement) {
          return (
            <strong className="transactions-tag">
              {WALLET_ADDRESS_TYPES_SVG[c.type]} {resolution}
            </strong>
          );
        }

        return resolution;
      }
    }
  }

  return address;
}

export function noop() {}

export function isEmpty(string) {
  if (string === 0) {
    return false;
  }

  if (!string) {
    return true;
  }

  if (typeof string === "object") {
    return true;
  }

  if (string.length === 0) {
    return true;
  }

  string = string.toString();

  return !string.trim();
}

export function classNames() {
  var classes = [];

  for (var i = 0; i < arguments.length; i++) {
    var arg = arguments[i];
    if (!arg) continue;

    var argType = typeof arg;

    if (argType === "string" || argType === "number") {
      classes.push(arg);
    } else if (Array.isArray(arg)) {
      if (arg.length) {
        var inner = classNames.apply(null, arg);
        if (inner) {
          classes.push(inner);
        }
      }
    } else if (argType === "object") {
      if (arg.toString !== Object.prototype.toString) {
        classes.push(arg.toString());
      } else {
        for (var key in arg) {
          if (hasOwn.call(arg, key) && arg[key]) {
            classes.push(key);
          }
        }
      }
    }
  }

  return classes.join(" ");
}

export function toDate(data) {
  const date = new Date(data);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    timeZoneName: "long",
  });
}
