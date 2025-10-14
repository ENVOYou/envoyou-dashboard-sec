'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';
import { EmissionCalculation } from '@/types/api';

interface Scope1Data {
  calculation_name: string;
  company_id: string;
  reporting_period_start: string;
  reporting_period_end: string;
  activity_data: Array<{
    activity_type: string;
    fuel_type: string;
    quantity: number;
    unit: string;
    data_quality: string;
  }>;
}

interface Scope2Data {
  calculation_name: string;
  company_id: string;
  reporting_period_start: string;
  reporting_period_end: string;
  electricity_consumption: Array<{
    activity_type: string;
    quantity: number;
    unit: string;
    location: string;
    data_quality: string;
  }>;
  calculation_method: 'location_based' | 'market_based';
}

export default function EmissionsPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'scope1' | 'scope2'>('scope1');

  // Scope 1 Form State
  const [scope1Data, setScope1Data] = useState<Scope1Data>({
    calculation_name: '',
    company_id: 'default-company',
    reporting_period_start: '',
    reporting_period_end: '',
    activity_data: [{
      activity_type: 'stationary_combustion',
      fuel_type: 'natural_gas',
      quantity: 0,
      unit: 'MMBtu',
      data_quality: 'measured'
    }]
  });

  // Scope 2 Form State
  const [scope2Data, setScope2Data] = useState<Scope2Data>({
    calculation_name: '',
    company_id: 'default-company',
    reporting_period_start: '',
    reporting_period_end: '',
    electricity_consumption: [{
      activity_type: 'electricity_consumption',
      quantity: 0,
      unit: 'MWh',
      location: 'California',
      data_quality: 'measured'
    }],
    calculation_method: 'location_based'
  });

  // Mutations
  const scope1Mutation = useMutation({
    mutationFn: (data: Scope1Data) => apiClient.calculateScope1(data),
    onSuccess: (result: any) => {
      queryClient.invalidateQueries({ queryKey: ['emissions-summary'] });
      queryClient.invalidateQueries({ queryKey: ['recent-calculations'] });
      alert(`Scope 1 calculation completed! Total CO2e: ${(result as any).total_co2e?.toFixed(2)} tCO2e`);
      // Reset form
      setScope1Data({
        calculation_name: '',
        company_id: 'default-company',
        reporting_period_start: '',
        reporting_period_end: '',
        activity_data: [{
          activity_type: 'stationary_combustion',
          fuel_type: 'natural_gas',
          quantity: 0,
          unit: 'MMBtu',
          data_quality: 'measured'
        }]
      });
    },
    onError: (error: any) => {
      alert(`Calculation failed: ${error.message}`);
    },
  });

  const scope2Mutation = useMutation({
    mutationFn: (data: Scope2Data) => apiClient.calculateScope2(data),
    onSuccess: (result: any) => {
      queryClient.invalidateQueries({ queryKey: ['emissions-summary'] });
      queryClient.invalidateQueries({ queryKey: ['recent-calculations'] });
      alert(`Scope 2 calculation completed! Total CO2e: ${(result as any).total_co2e?.toFixed(2)} tCO2e`);
      // Reset form
      setScope2Data({
        calculation_name: '',
        company_id: 'default-company',
        reporting_period_start: '',
        reporting_period_end: '',
        electricity_consumption: [{
          activity_type: 'electricity_consumption',
          quantity: 0,
          unit: 'MWh',
          location: 'California',
          data_quality: 'measured'
        }],
        calculation_method: 'location_based'
      });
    },
    onError: (error: any) => {
      alert(`Calculation failed: ${error.message}`);
    },
  });

  const handleScope1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scope1Data.calculation_name.trim()) {
      alert('Please enter a calculation name');
      return;
    }
    scope1Mutation.mutate(scope1Data);
  };

  const handleScope2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scope2Data.calculation_name.trim()) {
      alert('Please enter a calculation name');
      return;
    }
    scope2Mutation.mutate(scope2Data);
  };

  const addScope1Activity = () => {
    setScope1Data(prev => ({
      ...prev,
      activity_data: [...prev.activity_data, {
        activity_type: 'stationary_combustion',
        fuel_type: 'natural_gas',
        quantity: 0,
        unit: 'MMBtu',
        data_quality: 'measured'
      }]
    }));
  };

  const addScope2Activity = () => {
    setScope2Data(prev => ({
      ...prev,
      electricity_consumption: [...prev.electricity_consumption, {
        activity_type: 'electricity_consumption',
        quantity: 0,
        unit: 'MWh',
        location: 'California',
        data_quality: 'measured'
      }]
    }));
  };

  const removeScope1Activity = (index: number) => {
    setScope1Data(prev => ({
      ...prev,
      activity_data: prev.activity_data.filter((_, i) => i !== index)
    }));
  };

  const removeScope2Activity = (index: number) => {
    setScope2Data(prev => ({
      ...prev,
      electricity_consumption: prev.electricity_consumption.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900">Emissions Calculator</h1>
        <p className="mt-2 text-gray-600">
          Calculate greenhouse gas emissions using EPA-approved methodologies and factors.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('scope1')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'scope1'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Scope 1 Emissions
            </button>
            <button
              onClick={() => setActiveTab('scope2')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'scope2'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Scope 2 Emissions
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'scope1' && (
            <form onSubmit={handleScope1Submit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Calculation Name
                  </label>
                  <input
                    type="text"
                    value={scope1Data.calculation_name}
                    onChange={(e) => setScope1Data(prev => ({ ...prev, calculation_name: e.target.value }))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="e.g., Q4 2024 Stationary Combustion"
                    required
                  />
                </div>
                <div className="sm:col-span-2 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Reporting Period Start
                    </label>
                    <input
                      type="date"
                      value={scope1Data.reporting_period_start}
                      onChange={(e) => setScope1Data(prev => ({ ...prev, reporting_period_start: e.target.value }))}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Reporting Period End
                    </label>
                    <input
                      type="date"
                      value={scope1Data.reporting_period_end}
                      onChange={(e) => setScope1Data(prev => ({ ...prev, reporting_period_end: e.target.value }))}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Activity Data */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Fuel Consumption Data</h3>
                  <button
                    type="button"
                    onClick={addScope1Activity}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Add Activity
                  </button>
                </div>

                <div className="space-y-4">
                  {scope1Data.activity_data.map((activity, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="text-sm font-medium text-gray-900">Activity {index + 1}</h4>
                        {scope1Data.activity_data.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeScope1Activity(index)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Activity Type
                          </label>
                          <select
                            value={activity.activity_type}
                            onChange={(e) => {
                              const newData = [...scope1Data.activity_data];
                              newData[index].activity_type = e.target.value;
                              setScope1Data(prev => ({ ...prev, activity_data: newData }));
                            }}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          >
                            <option value="stationary_combustion">Stationary Combustion</option>
                            <option value="mobile_combustion">Mobile Combustion</option>
                            <option value="process_emissions">Process Emissions</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Fuel Type
                          </label>
                          <select
                            value={activity.fuel_type}
                            onChange={(e) => {
                              const newData = [...scope1Data.activity_data];
                              newData[index].fuel_type = e.target.value;
                              setScope1Data(prev => ({ ...prev, activity_data: newData }));
                            }}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          >
                            <option value="natural_gas">Natural Gas</option>
                            <option value="diesel">Diesel</option>
                            <option value="gasoline">Gasoline</option>
                            <option value="coal">Coal</option>
                            <option value="propane">Propane</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Quantity
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={activity.quantity}
                            onChange={(e) => {
                              const newData = [...scope1Data.activity_data];
                              newData[index].quantity = parseFloat(e.target.value) || 0;
                              setScope1Data(prev => ({ ...prev, activity_data: newData }));
                            }}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Unit
                          </label>
                          <select
                            value={activity.unit}
                            onChange={(e) => {
                              const newData = [...scope1Data.activity_data];
                              newData[index].unit = e.target.value;
                              setScope1Data(prev => ({ ...prev, activity_data: newData }));
                            }}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          >
                            <option value="MMBtu">MMBtu</option>
                            <option value="therms">Therms</option>
                            <option value="gallons">Gallons</option>
                            <option value="liters">Liters</option>
                            <option value="kg">Kilograms</option>
                            <option value="tons">Tons</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Data Quality
                          </label>
                          <select
                            value={activity.data_quality}
                            onChange={(e) => {
                              const newData = [...scope1Data.activity_data];
                              newData[index].data_quality = e.target.value;
                              setScope1Data(prev => ({ ...prev, activity_data: newData }));
                            }}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          >
                            <option value="measured">Measured</option>
                            <option value="calculated">Calculated</option>
                            <option value="estimated">Estimated</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={scope1Mutation.isPending}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {scope1Mutation.isPending ? 'Calculating...' : 'Calculate Scope 1 Emissions'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'scope2' && (
            <form onSubmit={handleScope2Submit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Calculation Name
                  </label>
                  <input
                    type="text"
                    value={scope2Data.calculation_name}
                    onChange={(e) => setScope2Data(prev => ({ ...prev, calculation_name: e.target.value }))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="e.g., Q4 2024 Electricity Consumption"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Calculation Method
                  </label>
                  <select
                    value={scope2Data.calculation_method}
                    onChange={(e) => setScope2Data(prev => ({ ...prev, calculation_method: e.target.value as 'location_based' | 'market_based' }))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="location_based">Location-Based</option>
                    <option value="market_based">Market-Based</option>
                  </select>
                </div>
                <div className="sm:col-span-2 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Reporting Period Start
                    </label>
                    <input
                      type="date"
                      value={scope2Data.reporting_period_start}
                      onChange={(e) => setScope2Data(prev => ({ ...prev, reporting_period_start: e.target.value }))}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Reporting Period End
                    </label>
                    <input
                      type="date"
                      value={scope2Data.reporting_period_end}
                      onChange={(e) => setScope2Data(prev => ({ ...prev, reporting_period_end: e.target.value }))}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Electricity Consumption Data */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Electricity Consumption Data</h3>
                  <button
                    type="button"
                    onClick={addScope2Activity}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Add Consumption
                  </button>
                </div>

                <div className="space-y-4">
                  {scope2Data.electricity_consumption.map((consumption, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="text-sm font-medium text-gray-900">Consumption {index + 1}</h4>
                        {scope2Data.electricity_consumption.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeScope2Activity(index)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Activity Type
                          </label>
                          <select
                            value={consumption.activity_type}
                            onChange={(e) => {
                              const newData = [...scope2Data.electricity_consumption];
                              newData[index].activity_type = e.target.value;
                              setScope2Data(prev => ({ ...prev, electricity_consumption: newData }));
                            }}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          >
                            <option value="electricity_consumption">Electricity Consumption</option>
                            <option value="steam_consumption">Steam Consumption</option>
                            <option value="heat_consumption">Heat Consumption</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Quantity
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={consumption.quantity}
                            onChange={(e) => {
                              const newData = [...scope2Data.electricity_consumption];
                              newData[index].quantity = parseFloat(e.target.value) || 0;
                              setScope2Data(prev => ({ ...prev, electricity_consumption: newData }));
                            }}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Unit
                          </label>
                          <select
                            value={consumption.unit}
                            onChange={(e) => {
                              const newData = [...scope2Data.electricity_consumption];
                              newData[index].unit = e.target.value;
                              setScope2Data(prev => ({ ...prev, electricity_consumption: newData }));
                            }}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          >
                            <option value="MWh">MWh</option>
                            <option value="kWh">kWh</option>
                            <option value="GJ">GJ</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Location
                          </label>
                          <select
                            value={consumption.location}
                            onChange={(e) => {
                              const newData = [...scope2Data.electricity_consumption];
                              newData[index].location = e.target.value;
                              setScope2Data(prev => ({ ...prev, electricity_consumption: newData }));
                            }}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          >
                            <option value="California">California</option>
                            <option value="Texas">Texas</option>
                            <option value="New York">New York</option>
                            <option value="Florida">Florida</option>
                            <option value="Illinois">Illinois</option>
                            <option value="Pennsylvania">Pennsylvania</option>
                            <option value="Ohio">Ohio</option>
                            <option value="Georgia">Georgia</option>
                            <option value="North Carolina">North Carolina</option>
                            <option value="Michigan">Michigan</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Data Quality
                          </label>
                          <select
                            value={consumption.data_quality}
                            onChange={(e) => {
                              const newData = [...scope2Data.electricity_consumption];
                              newData[index].data_quality = e.target.value;
                              setScope2Data(prev => ({ ...prev, electricity_consumption: newData }));
                            }}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          >
                            <option value="measured">Measured</option>
                            <option value="calculated">Calculated</option>
                            <option value="estimated">Estimated</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={scope2Mutation.isPending}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {scope2Mutation.isPending ? 'Calculating...' : 'Calculate Scope 2 Emissions'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}