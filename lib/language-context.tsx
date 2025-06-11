"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Locale = "en" | "fr";

interface LanguageContextType {
  language: Locale;
  setLanguage: (language: Locale) => void;
  locale: Locale; // Keep for backward compatibility
  setLocale: (locale: Locale) => void; // Keep for backward compatibility
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

interface LanguageProviderProps {
  children: React.ReactNode;
}

// Static messages object
const messages = {
  en: {
    "common.dashboard": "Dashboard",
    "common.inventory": "Inventory",
    "common.production": "Production",
    "common.purchases": "Purchases",
    "common.sales": "Sales",
    "common.hr": "HR",
    "common.expenses": "Expenses",
    "common.settings": "Settings",
    "common.export": "Export",
    "common.loading": "Loading",
    "common.filter": "Filter",
    "common.dateRange": "Date Range",
    "common.status": "Status",
    "common.actions": "Actions",
    "common.date": "Date",
    "common.view": "View",
    "common.edit": "Edit",
    "dashboard.title": "Dashboard",
    "dashboard.revenue": "Revenue",
    "dashboard.orders": "Orders",
    "dashboard.products": "Products",
    "dashboard.customers": "Customers",
    "dashboard.recentActivity": "Recent Activity",
    "dashboard.revenueChart": "Revenue Chart",
    "dashboard.inventoryOverview": "Inventory Overview",
    "dashboard.productionStatus": "Production Status",
    "sales.title": "Sales Management",
    "sales.description":
      "Track sales orders, monitor revenue, and manage customer relationships.",
    "sales.newSale": "New Sale",
    "sales.totalRevenue": "Total Revenue",
    "sales.totalOrders": "Total Orders",
    "sales.averageOrderValue": "Average Order Value",
    "sales.newCustomers": "New Customers",
    "sales.recentOrders": "Recent Sales Orders",
    "sales.recentOrdersDescription":
      "Latest sales orders and their current status",
    "sales.orderId": "Order ID",
    "sales.customer": "Customer",
    "sales.items": "Items",
    "sales.item": "item",
    "sales.amount": "Amount",
    "sales.ordersTableCaption":
      "A list of recent sales orders with their details and status.",
    "sales.completed": "Completed",
    "sales.shipped": "Shipped",
    "sales.processing": "Processing",
    "sales.pending": "Pending",
    "sales.cancelled": "Cancelled",
    "inventory.title": "Inventory Management",
    "inventory.description":
      "Manage your inventory, track stock levels, and monitor product performance",
    "inventory.addProduct": "Add Product",
    "inventory.products": "Products",
    "inventory.searchProducts": "Search products...",
    "inventory.product": "Product",
    "inventory.sku": "SKU",
    "inventory.category": "Category",
    "inventory.stockLevel": "Stock Level",
    "inventory.unitPrice": "Unit Price",
    "production.title": "Production Management",
    "production.description":
      "Manage production orders, track manufacturing progress, and optimize workflows.",
    "production.newOrder": "New Production Order",
    "production.activeOrders": "Active Orders",
    "production.inProgress": "In Progress",
    "production.completed": "Completed Today",
    "production.efficiency": "Efficiency Rate",
    "production.recentOrders": "Recent Production Orders",
    "production.orderId": "Order ID",
    "production.product": "Product",
    "production.quantity": "Quantity",
    "production.startDate": "Start Date",
    "production.dueDate": "Due Date",
    "purchases.title": "Purchase Management",
    "purchases.description":
      "Manage purchase orders, track suppliers, and monitor inventory procurement.",
    "purchases.newPurchase": "New Purchase Order",
    "purchases.totalSpent": "Total Spent",
    "purchases.pendingOrders": "Pending Orders",
    "purchases.suppliers": "Active Suppliers",
    "purchases.recentPurchases": "Recent Purchase Orders",
    "purchases.supplier": "Supplier",
    "purchases.orderDate": "Order Date",
    "purchases.expectedDate": "Expected Date",
    "hr.title": "Human Resources",
    "hr.description":
      "Manage employees, track attendance, and handle HR operations.",
    "hr.addEmployee": "Add Employee",
    "hr.totalEmployees": "Total Employees",
    "hr.present": "Present Today",
    "hr.onLeave": "On Leave",
    "hr.payroll": "Payroll This Month",
    "hr.recentActivity": "Recent HR Activity",
    "hr.employees": "Employees",
    "hr.employee": "Employee",
    "hr.department": "Department",
    "hr.position": "Position",
    "hr.joinDate": "Join Date",
    "expenses.title": "Expense Management",
    "expenses.description":
      "Track business expenses, manage budgets, and analyze spending patterns.",
    "expenses.addExpense": "Add Expense",
    "expenses.totalExpenses": "Total Expenses",
    "expenses.thisMonth": "This Month",
    "expenses.pending": "Pending Approval",
    "expenses.categories": "Categories",
    "expenses.recentExpenses": "Recent Expenses",
    "expenses.expense": "Expense",
    "expenses.category": "Category",
    "expenses.expenseDate": "Date",
    "settings.title": "Settings",
    "settings.description":
      "Configure system settings, user preferences, and application options.",
    "settings.general": "General Settings",
    "settings.users": "User Management",
    "settings.system": "System Configuration",
    "settings.backup": "Backup & Restore",
    "settings.notifications": "Notifications",
    "settings.security": "Security Settings",
    "production.bomListTitle": "Bill of Materials List",
    "production.newBOM": "New BOM",
    "production.bomId": "BOM ID",
    "production.bomName": "Name",
    "production.bomDescription": "Description",
    "production.bomFinalProduct": "Final Product",
    "production.createdAt": "Created At",
    "production.updatedAt": "Updated At",
    "production.editBOM": "Edit BOM",
    "production.createBOM": "Create BOM",
    "production.bomNotFound": "BOM not found",
    "production.components": "Components",
    "production.componentName": "Component Name",
    "production.unit": "Unit",
    "production.addComponent": "Add Component",
    "common.save": "Save",
    "common.delete": "Delete",
    "production.confirmDeleteBOM": "Are you sure you want to delete this BOM?",
    "production.ordersListTitle": "Production Orders List",
    "production.orderNumber": "Order Number",
    "production.bom": "BOM",
    "production.qtyOrdered": "Quantity Ordered",
    "production.status": "Status",
    "production.priority": "Priority",
    "production.startDate": "Start Date",
    "production.expectedEndDate": "Expected End Date",
    "production.confirmDeleteOrder": "Are you sure you want to delete this production order?",
    "production.createOrder": "Create Production Order",
    "production.selectProduct": "Select Product",
    "production.selectBOM": "Select BOM",
    "production.planned": "Planned",
    "production.inProgress": "In Progress",
    "production.completed": "Completed",
    "production.cancelled": "Cancelled",
    "production.high": "High",
    "production.medium": "Medium",
    "production.low": "Low",
    "production.notes": "Notes",
    "common.bomManagement": "BOM Management",
    "common.productionOrders": "Production Orders",
  },
  fr: {
    "common.dashboard": "Tableau de bord",
    "common.inventory": "Inventaire",
    "common.production": "Production",
    "common.purchases": "Achats",
    "common.sales": "Ventes",
    "common.hr": "RH",
    "common.expenses": "Dépenses",
    "common.settings": "Paramètres",
    "common.export": "Exporter",
    "common.loading": "Chargement",
    "common.filter": "Filtrer",
    "common.dateRange": "Plage de dates",
    "common.status": "Statut",
    "common.actions": "Actions",
    "common.date": "Date",
    "common.view": "Voir",
    "common.edit": "Modifier",
    "dashboard.title": "Tableau de bord",
    "dashboard.revenue": "Revenus",
    "dashboard.orders": "Commandes",
    "dashboard.products": "Produits",
    "dashboard.customers": "Clients",
    "dashboard.recentActivity": "Activité récente",
    "dashboard.revenueChart": "Graphique des revenus",
    "dashboard.inventoryOverview": "Aperçu des stocks",
    "dashboard.productionStatus": "État de la production",
    "sales.title": "Gestion des ventes",
    "sales.description":
      "Suivez les commandes de vente, surveillez les revenus et gérez les relations clients.",
    "sales.newSale": "Nouvelle vente",
    "sales.totalRevenue": "Chiffre d'affaires total",
    "sales.totalOrders": "Total des commandes",
    "sales.averageOrderValue": "Valeur moyenne des commandes",
    "sales.newCustomers": "Nouveaux clients",
    "sales.recentOrders": "Commandes récentes",
    "sales.recentOrdersDescription":
      "Dernières commandes de vente et leur statut actuel",
    "sales.orderId": "ID de commande",
    "sales.customer": "Client",
    "sales.items": "Articles",
    "sales.item": "article",
    "sales.amount": "Montant",
    "sales.ordersTableCaption":
      "Liste des commandes de vente récentes avec leurs détails et statut.",
    "sales.completed": "Terminé",
    "sales.shipped": "Expédié",
    "sales.processing": "En traitement",
    "sales.pending": "En attente",
    "sales.cancelled": "Annulé",
    "inventory.title": "Gestion des stocks",
    "inventory.description":
      "Gérez votre inventaire, suivez les niveaux de stock et surveillez les performances des produits",
    "inventory.addProduct": "Ajouter un produit",
    "inventory.products": "Produits",
    "inventory.searchProducts": "Rechercher des produits...",
    "inventory.product": "Produit",
    "inventory.sku": "SKU",
    "inventory.category": "Catégorie",
    "inventory.stockLevel": "Niveau de stock",
    "inventory.unitPrice": "Prix unitaire",
    "production.title": "Gestion de la production",
    "production.description":
      "Gérez les ordres de production, suivez les progrès de fabrication et optimisez les flux de travail.",
    "production.newOrder": "Nouvel ordre de production",
    "production.activeOrders": "Ordres actifs",
    "production.inProgress": "En cours",
    "production.completed": "Terminé aujourd'hui",
    "production.efficiency": "Taux d'efficacité",
    "production.recentOrders": "Ordres de production récents",
    "production.orderId": "ID d'ordre",
    "production.product": "Produit",
    "production.quantity": "Quantité",
    "production.startDate": "Date de début",
    "production.dueDate": "Date d'échéance",
    "purchases.title": "Gestion des achats",
    "purchases.description":
      "Gérez les bons de commande, suivez les fournisseurs et surveillez l'approvisionnement des stocks.",
    "purchases.newPurchase": "Nouveau bon de commande",
    "purchases.totalSpent": "Total dépensé",
    "purchases.pendingOrders": "Commandes en attente",
    "purchases.suppliers": "Fournisseurs actifs",
    "purchases.recentPurchases": "Bons de commande récents",
    "purchases.supplier": "Fournisseur",
    "purchases.orderDate": "Date de commande",
    "purchases.expectedDate": "Date prévue",
    "hr.title": "Ressources humaines",
    "hr.description":
      "Gérez les employés, suivez les présences et gérez les opérations RH.",
    "hr.addEmployee": "Ajouter un employé",
    "hr.totalEmployees": "Total des employés",
    "hr.present": "Présent aujourd'hui",
    "hr.onLeave": "En congé",
    "hr.payroll": "Paie ce mois",
    "hr.recentActivity": "Activité RH récente",
    "hr.employees": "Employés",
    "hr.employee": "Employé",
    "hr.department": "Département",
    "hr.position": "Poste",
    "hr.joinDate": "Date d'embauche",
    "expenses.title": "Gestion des dépenses",
    "expenses.description":
      "Suivez les dépenses professionnelles, gérez les budgets et analysez les modèles de dépenses.",
    "expenses.addExpense": "Ajouter une dépense",
    "expenses.totalExpenses": "Total des dépenses",
    "expenses.thisMonth": "Ce mois",
    "expenses.pending": "En attente d'approbation",
    "expenses.categories": "Catégories",
    "expenses.recentExpenses": "Dépenses récentes",
    "expenses.expense": "Dépense",
    "expenses.category": "Catégorie",
    "expenses.expenseDate": "Date",
    "settings.title": "Paramètres",
    "settings.description":
      "Configurez les paramètres système, les préférences utilisateur et les options d'application.",
    "settings.general": "Paramètres généraux",
    "settings.users": "Gestion des utilisateurs",
    "settings.system": "Configuration système",
    "settings.backup": "Sauvegarde et restauration",
    "settings.notifications": "Notifications",
    "settings.security": "Paramètres de sécurité",
    "production.bomListTitle": "Liste des nomenclatures",
    "production.newBOM": "Nouvelle nomenclature",
    "production.bomId": "ID",
    "production.bomName": "Nom",
    "production.bomDescription": "Description",
    "production.bomFinalProduct": "Produit final",
    "production.createdAt": "Créé le",
    "production.updatedAt": "Mis à jour le",
    "production.editBOM": "Modifier la nomenclature",
    "production.createBOM": "Créer une nomenclature",
    "production.bomNotFound": "Nomenclature introuvable",
    "production.components": "Composants",
    "production.componentName": "Nom du composant",
    "production.unit": "Unité",
    "production.addComponent": "Ajouter un composant",
    "common.save": "Enregistrer",
    "common.delete": "Supprimer",
    "production.confirmDeleteBOM": "Êtes-vous sûr de vouloir supprimer cette nomenclature ?",
    "production.ordersListTitle": "Liste des ordres de production",
    "production.orderNumber": "Numéro d'ordre",
    "production.bom": "Nomenclature",
    "production.qtyOrdered": "Quantité commandée",
    "production.status": "Statut",
    "production.priority": "Priorité",
    "production.startDate": "Date de début",
    "production.expectedEndDate": "Date de fin prévue",
    "production.confirmDeleteOrder": "Êtes-vous sûr de vouloir supprimer cet ordre de production ?",
    "production.createOrder": "Créer un ordre de production",
    "production.selectProduct": "Sélectionner un produit",
    "production.selectBOM": "Sélectionner une nomenclature",
    "production.planned": "Planifié",
    "production.inProgress": "En cours",
    "production.completed": "Terminé",
    "production.cancelled": "Annulé",
    "production.high": "Haute",
    "production.medium": "Moyenne",
    "production.low": "Basse",
    "production.notes": "Remarques",
    "common.bomManagement": "Gestion des nomenclatures",
    "common.productionOrders": "Ordres de production",
  },
};

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [isInitialized, setIsInitialized] = useState(false);

  // Load saved language preference on mount
  useEffect(() => {
    const savedLocale = localStorage.getItem("preferred-language") as Locale;
    if (savedLocale && (savedLocale === "en" || savedLocale === "fr")) {
      setLocaleState(savedLocale);
    } else {
      // Detect browser language
      const browserLocale = navigator.language.startsWith("fr") ? "fr" : "en";
      setLocaleState(browserLocale);
    }
    setIsInitialized(true);
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("preferred-language", newLocale);
  };

  const t = (key: string) => {
    return messages[locale][key as keyof (typeof messages)["en"]] || key;
  };

  // Don't render until we've loaded the saved preference
  if (!isInitialized) {
    return <div>{t("common.loading")}</div>;
  }
  const contextValue: LanguageContextType = {
    language: locale,
    setLanguage: setLocale,
    locale,
    setLocale,
    t,
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

// Hook for easy access to translations
export function useTranslations(namespace?: string) {
  const { t } = useLanguage();

  return (key: string) => {
    const fullKey = namespace ? `${namespace}.${key}` : key;
    return t(fullKey);
  };
}
