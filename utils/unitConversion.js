const conversionFactors = {
  kg: {
    g: 1000,
    mg: 1000000,
  },
  g: {
    kg: 0.001,
    mg: 1000,
  },
  mg: {
    kg: 0.000001,
    g: 0.001,
  },
  l: {
    ml: 1000,
  },
  ml: {
    l: 0.001,
  },
  piece: {
    piece: 1,
  },
};

const convertUnit = function contUnit(value, fromUnit, toUnit) {
  if (fromUnit === toUnit) return value;

  const fromUnitLower = fromUnit.toLowerCase();
  const toUnitLower = toUnit.toLowerCase();

  if (fromUnitLower === 'piece' || toUnitLower === 'piece') {
    if (fromUnitLower === toUnitLower) {
      return value;
    } else {
      throw new Error(`Cannot convert between 'piece' and other units`);
    }
  }

  if (
    conversionFactors[fromUnitLower] &&
    conversionFactors[fromUnitLower][toUnitLower]
  ) {
    return value * conversionFactors[fromUnitLower][toUnitLower];
  }

  throw new Error(`Conversion from ${fromUnit} to ${toUnit} not supported`);
};

export default convertUnit;
