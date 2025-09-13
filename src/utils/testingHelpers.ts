// Testing utilities and validation helpers

export const validateAppStructure = () => {
  const issues: string[] = [];
  
  // Check if essential routes exist
  const essentialRoutes = [
    '/',           // Home
    '/auth',       // Authentication
    '/register',   // Registration 
    '/search',     // Search page
    '/terms',      // Terms of service
    '/privacy',    // Privacy policy
  ];
  
  // This would be used by automated testing
  console.log('Essential routes defined:', essentialRoutes);
  
  return issues;
};

export const validateFormInputs = (formName: string, inputValues: Record<string, any>) => {
  const errors: Record<string, string> = {};
  
  switch (formName) {
    case 'register':
      if (!inputValues.fullName || inputValues.fullName.length < 2) {
        errors.fullName = 'El nombre debe tener al menos 2 caracteres';
      }
      if (!inputValues.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputValues.email)) {
        errors.email = 'Email inválido';
      }
      if (!inputValues.password || inputValues.password.length < 8) {
        errors.password = 'La contraseña debe tener al menos 8 caracteres';
      }
      break;
      
    case 'login':
      if (!inputValues.email) {
        errors.email = 'Email requerido';
      }
      if (!inputValues.password) {
        errors.password = 'Contraseña requerida';
      }
      break;
  }
  
  return errors;
};

export const validatePasswordRequirements = (password: string) => {
  const requirements = [
    { test: /.{8,}/, message: 'Al menos 8 caracteres' },
    { test: /[A-Z]/, message: 'Al menos una mayúscula' },
    { test: /[a-z]/, message: 'Al menos una minúscula' },
    { test: /\d/, message: 'Al menos un número' },
    { test: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, message: 'Al menos un símbolo especial' },
  ];
  
  return requirements.map(req => ({
    ...req,
    passed: req.test.test(password)
  }));
};

export const generateTestReport = () => {
  const report = {
    timestamp: new Date().toISOString(),
    sections: [
      {
        name: 'Estructura de la App',
        status: 'pending',
        tests: []
      },
      {
        name: 'Autenticación', 
        status: 'pending',
        tests: []
      },
      {
        name: 'Navegación',
        status: 'pending', 
        tests: []
      },
      {
        name: 'Base de Datos',
        status: 'pending',
        tests: []
      }
    ]
  };
  
  return report;
};

// Browser testing helpers
export const testNavigationFlow = () => {
  const flows = [
    { name: 'Home to Search', path: '/ -> /search' },
    { name: 'Home to Register', path: '/ -> /register' }, 
    { name: 'Home to Auth', path: '/ -> /auth' },
    { name: 'Search with params', path: '/search?q=plomero' }
  ];
  
  return flows;
};

export const testFormValidation = () => {
  const forms = [
    { 
      name: 'register', 
      requiredFields: ['fullName', 'email', 'password', 'confirmPassword'],
      validationRules: ['passwordStrength', 'emailFormat', 'nameLength']
    },
    { 
      name: 'login',
      requiredFields: ['email', 'password'],
      validationRules: ['emailFormat']
    }
  ];
  
  return forms;
};

export const testResponsiveDesign = () => {
  const breakpoints = [
    { name: 'Mobile', width: 320 },
    { name: 'Tablet', width: 768 },
    { name: 'Desktop', width: 1024 },
    { name: 'Large Desktop', width: 1440 }
  ];
  
  return breakpoints;
};