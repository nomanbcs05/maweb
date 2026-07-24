import React, { useState, useEffect } from 'react';
import { 
  BarChart, Package, ShoppingCart, Plus, Edit2, Trash2, Copy, 
  RefreshCw, DollarSign, AlertTriangle 
} from 'lucide-react';
import type { Product, Order, Category } from '../types';
import { API } from '../services/api';