// Billing configuration from environment variables
// All variables are optional to support billing_disabled mode

export const billingConfig = {
  // Core settings
  billingDisabled: import.meta.env.VITE_BILLING_DISABLED === 'true',
  paymentProvider: (import.meta.env.VITE_PAYMENT_PROVIDER || 'mercadopago') as 'stripe' | 'mercadopago' | 'mock',
  currency: import.meta.env.VITE_CURRENCY || 'ARS',
  
  // Trial settings
  trialDays: parseInt(import.meta.env.VITE_TRIAL_DAYS || '90'),
  
  // Prices (in cents or smallest currency unit)
  prices: {
    profesional: parseInt(import.meta.env.VITE_PRICE_PROFESIONAL || '14990'),
    emprendedor: parseInt(import.meta.env.VITE_PRICE_EMPRENDEDOR || '8999'),
    premium: parseInt(import.meta.env.VITE_PRICE_PREMIUM || '24990'),
  },
  
  // Helper functions
  isBillingEnabled(): boolean {
    return !this.billingDisabled && this.paymentProvider !== 'mock';
  },
  
  formatPrice(price: number): string {
    return `${this.currency} $${price.toLocaleString()}`;
  },
  
  canProcessPayments(): boolean {
    return this.isBillingEnabled();
  }
};
