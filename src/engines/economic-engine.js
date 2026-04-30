/**
 * LeafScan AI - Economic Intelligence Engine
 * Connects pathological diagnostics to financial outcomes and resource management.
 */

export const EconomicEngine = {
  // Global Commodity Prices (Mock Data)
  CROP_VALUES: {
    'Rice': 0.50, // per kg
    'Potato': 0.45,
    'Tomato': 1.20,
    'Coffee': 4.80,
    'Cocoa': 3.20,
    'Corn': 0.25,
    'Sugarcane': 0.15
  },

  /**
   * Calculates the dynamic Value-at-Risk ($) based on wind-driven spread.
   */
  calculateVAR(crop, yieldImpact, windSpeed = 5) {
    const baseValue = this.CROP_VALUES[crop] || 1.0;
    const impactPercent = parseFloat(yieldImpact) / 100;
    
    // Calculate the area of the Risk Cone (40 degree wedge)
    // Radius in meters based on wind speed (e.g. 5m/s -> 500m)
    const spreadRadius = Math.max(200, windSpeed * 100); 
    const coneAreaSqm = (Math.PI * Math.pow(spreadRadius, 2)) * (40 / 360);
    
    // Total Value of at-risk Plot (Assumes avg yield of 2.5kg per sqm)
    const totalPotentialValue = coneAreaSqm * 2.5 * baseValue;
    const valueAtRisk = totalPotentialValue * impactPercent;
    
    // Dynamic rate: Assume it spreads to the cone edge over 48 hours
    const varPerHour = valueAtRisk / 48;
    
    return {
      areaSqm: Math.round(coneAreaSqm),
      totalPlotValue: Math.round(totalPotentialValue),
      valueAtRisk: Math.round(valueAtRisk),
      varPerHour: varPerHour.toFixed(2),
      savedValue: Math.round(valueAtRisk * 0.85) // 85% recovery with immediate treatment
    };
  },

  /**
   * Cross-references the required treatment volume with the local Inventory.
   */
  async getInventoryOptimization(disease, inventoryItems, areaSqm) {
    const hectares = areaSqm / 10000; // 1 hectare = 10,000 sqm
    
    const diseaseMap = {
      'blight': { needed: 'Fungicide', amountPerHa: 2.5, unit: 'L' },
      'rust': { needed: 'Copper Spray', amountPerHa: 1.2, unit: 'L' },
      'bacterial': { needed: 'Antibacterial Treatment', amountPerHa: 0.5, unit: 'L' },
      'spot': { needed: 'Sulfur Dust', amountPerHa: 5, unit: 'kg' },
      'mildew': { needed: 'Neem Oil', amountPerHa: 3.0, unit: 'L' }
    };

    const typeKey = Object.keys(diseaseMap).find(k => disease.toLowerCase().includes(k)) || null;
    if (!typeKey) return null; // No specific treatment logic for healthy or unknown
    
    const requirement = diseaseMap[typeKey];
    const totalNeeded = (requirement.amountPerHa * hectares).toFixed(2);

    const inStock = inventoryItems.find(item => 
      item.name.toLowerCase().includes(requirement.needed.toLowerCase()) || 
      item.category.toLowerCase() === requirement.needed.toLowerCase()
    );

    let currentQty = 0;
    if (inStock && inStock.quantity) {
      currentQty = parseFloat(inStock.quantity);
    }

    const deficit = (totalNeeded - currentQty).toFixed(2);
    const hasEnough = currentQty >= totalNeeded;

    return {
      treatmentName: requirement.needed,
      requiredAmount: totalNeeded,
      unit: requirement.unit,
      inStock: inStock !== undefined,
      currentQuantity: currentQty,
      hasEnough: hasEnough,
      deficit: hasEnough ? 0 : deficit,
      action: hasEnough ? 'Ready to Dispense' : 'CRITICAL SUPPLY DEFICIT'
    };
  }
};
