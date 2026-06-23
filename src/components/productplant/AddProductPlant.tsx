import { yupResolver } from '@hookform/resolvers/yup'
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Box,
  IconButton,
  Typography,
  Button,
  FormControlLabel,
  FormHelperText,
  Switch
} from '@mui/material'
import React, { useEffect, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import SubmitButton from 'src/components/common/button/Button'
import RHFInput from 'src/hook-forms/RHFInput'
import RHFNumberInput from 'src/hook-forms/RHFNUmberInput'
import RHFAutoComplete from 'src/hook-forms/RHFAutoComplete'
import axiosInstance from 'src/services/axios'
import * as yup from 'yup'
import HighlightOffIcon from '@mui/icons-material/HighlightOff'
import toast, { Toaster } from 'react-hot-toast'
import { decodeParams } from 'src/utils/encodeid'

type OptionItem = { label: string; value: number }

const schema = yup.object().shape({
  plant_id: yup
    .number()
    .required('Plant is required.')
    .typeError('Please select a plant.')
    .min(1, 'Please select a plant.'),
  categories_id: yup
    .mixed()
    .required('Category is required.'),
  product_id: yup
    .mixed()
    .required('Product is required.'),
  grade_id: yup
    .mixed()
    .required('Grade is required.'),
  polish_type_id: yup
    .mixed()
    .required('Polish Type is required.'),
  custom_grade: yup
    .string()
    .max(100, 'Custom grade cannot be more than 100 characters long.')
    .transform(value => (value === '' ? null : value))
    .nullable(),
  moisture_content: yup
    .number()
    .typeError('Moisture content must be a number.')
    .min(0, 'Moisture content must be 0 or greater.')
    .nullable(),
  purity: yup
    .number()
    .typeError('Purity must be a number.')
    .min(0, 'Purity must be 0 or greater.')
    .nullable(),
  foreign_matter: yup
    .number()
    .typeError('Foreign matter must be a number.')
    .min(0, 'Foreign matter must be 0 or greater.')
    .nullable(),
  // polish_type_id: yup
  //   // .mixed()
  //   .number()
  //   .required('Polish Type is required.')
  //   .typeError('Please select a polish type.')
  //   .min(1, 'Please select a polish type.'),
  custom_polish_type: yup
    .string()
    .max(100, 'Custom polish type cannot be more than 100 characters long.')
    .transform(value => (value === '' ? null : value))
    .nullable(),
  packaging_kg: yup
    .number()
    .typeError('Packaging must be a number.')
    .min(0, 'Packaging must be 0 or greater.')
    .nullable(),
  grain_size: yup
    .number()
    .typeError('Grain size must be a number.')
    .min(0, 'Grain size must be 0 or greater.')
    .nullable(),
  min_order_quantity: yup
    .number()
    .typeError('Min order quantity must be a number.')
    .min(0, 'Min order quantity must be 0 or greater.')
    .required('Min order quantity is required.'),
  price_per_unit: yup
    .number()
    .typeError('Price per unit must be a number.')
    .min(0, 'Price per unit must be 0 or greater.')
    .required('Price per unit is required.'),
  price_unit: yup
    .number()
    .typeError('Price unit must be a number.')
    .min(0, 'Price unit must be 0 or greater.')
    .required('Price unit is required.'),
  current_stock: yup
    .number()
    .typeError('Current stock must be a number.')
    .min(0, 'Current stock must be 0 or greater.')
    .required('Current stock is required.'),
  stock_unit: yup
    .number()
    .typeError('Stock unit must be a number.')
    .min(0, 'Stock unit must be 0 or greater.')
    .required('Stock unit is required.'),
  is_available_for_sale: yup.boolean().required('Please set availability status.'),
  notes: yup
    .string()
    .max(500, 'Notes cannot be more than 500 characters long.')
    .transform(value => (value === '' ? null : value))
    .nullable()
})

interface FormData {
  plant_id: number
  categories_id: number
  product_id: number
  grade_id: number
  custom_grade?: string | null
  moisture_content?: number | null
  purity?: number | null
  foreign_matter?: number | null
  polish_type_id: number
  custom_polish_type?: string | null
  packaging_kg?: number | null
  grain_size?: number | null
  min_order_quantity: number
  price_per_unit: number
  price_unit: number
  current_stock: number
  stock_unit: number
  is_available_for_sale: boolean
  notes?: string | null
  description?: string | null
}

interface SelectedItem {
  id: number
  plant_id?: number
  product_id?: number
  grade_id?: number
  custom_grade?: string | null
  moisture_content?: number | null
  purity?: number | null
  foreign_matter?: number | null
  polish_type_id?: number
  custom_polish_type?: string | null
  packaging_kg?: number | null
  grain_size?: number | null
  min_order_quantity?: number | null
  price_per_unit?: number | null
  price_unit?: number | null
  current_stock?: number | null
  stock_unit?: number | null
  categories_id?: number | number[]
  categories_ids?: number[]
  is_available_for_sale?: number | boolean
  notes?: string | null
  description?: string | null
  grade?: { id: number; name: string }
  polish_type?: { id: number; name: string }
  product?: { id: number; name: string; categories?: { id: number; name: string } }
  categories?: { id: number; name: string }
}

interface Props {
  open: boolean
  handleClose: () => void
  fetchData: any
  selectedItem?: SelectedItem
  plantId?: number | string
}

const defaultValues: Partial<FormData> = {
  plant_id: undefined as any,
  categories_id: undefined as any,
  product_id: undefined as any,
  grade_id: undefined as any,
  custom_grade: null,
  moisture_content: null,
  purity: null,
  foreign_matter: null,
  polish_type_id: undefined as any,
  custom_polish_type: null,
  packaging_kg: null,
  grain_size: null,
  min_order_quantity: 1,
  price_per_unit: 0,
  price_unit: 1,
  current_stock: 0,
  stock_unit: 1,
  is_available_for_sale: true,
  notes: null,
  description: null
}

const AddProductPlant = ({ open, handleClose, fetchData, selectedItem, plantId }: Props) => {
  const [isLoading, setIsLoading] = useState(false)
  const [plantOptions, setPlantOptions] = useState<OptionItem[]>([])
  const [loadingPlants, setLoadingPlants] = useState(false)
  const [productOptions, setProductOptions] = useState<OptionItem[]>([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [gradeOptions, setGradeOptions] = useState<OptionItem[]>([])
  const [loadingGrades, setLoadingGrades] = useState(false)
  const [polishOptions, setPolishOptions] = useState<OptionItem[]>([])
  const [loadingPolishTypes, setLoadingPolishTypes] = useState(false)
  const [categoryOptions, setCategoryOptions] = useState<OptionItem[]>([])
  const [loadingCategories, setLoadingCategories] = useState(false)

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    reset,
    watch,
    formState: { errors }
  } = useForm<FormData>({ resolver: yupResolver(schema), defaultValues, mode: 'onChange' })

  // Watch form values for debugging
  const watchedValues = watch()
  const selectedCategoryId = watch('categories_id')
  const selectedProductId = watch('product_id')

  const [effectivePlantId, setEffectivePlantId] = useState<number | undefined>(undefined)
  const isSettingCategories = useRef(false)

  const getSingleCategoryId = (value?: number | number[] | null) => {
    if (Array.isArray(value)) {
      const first = Number(value[0])
      return Number.isNaN(first) ? undefined : first
    }

    if (value === undefined || value === null) {
      return undefined
    }

    const numeric = Number(value)
    return Number.isNaN(numeric) ? undefined : numeric
  }

  const getNumericId = (val: any) => {
    if (val && typeof val === 'object' && 'id' in val) return Number(val.id);
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  }

  // Fetch dropdown data
  const fetchPlants = async () => {
    setLoadingPlants(true)
    try {
      const response = await axiosInstance.get('/api/v1/admin/plant/getAllPlants?pageNo=0&limit=1000')
      const options = (response.data.data?.data ?? []).map((item: any) => ({
        label: item.plant_name,
        value: item.id
      }))
      setPlantOptions(options)
    } catch (e) {
      toast.error('Failed to load plants.')
    } finally {
      setLoadingPlants(false)
    }
  }

  const fetchProductsByCategory = async (categoryId: number | undefined) => {
    if (!categoryId) {
      setProductOptions([])
      setValue('product_id', undefined as any)
      return
    }

    setLoadingProducts(true)
    try {
      const response = await axiosInstance.get(
        `/api/v1/admin/products/getAllProducts?pageNo=0&limit=1000&categories_id=${categoryId}&is_active=1`
      )
      const options = (response.data.data?.data ?? []).map((item: any) => ({
        label: item.name,
        value: item.id
      }))

      setProductOptions(options)
    } catch (e) {
      toast.error('Failed to load products.')
    } finally {
      setLoadingProducts(false)
    }
  }

  const fetchGrades = async () => {
    setLoadingGrades(true)
    try {
      const response = await axiosInstance.get('/api/v1/admin/productGrades/getAllProductGrades?pageNo=0&limit=1000')
      const options = (response.data.data?.data ?? []).map((item: any) => ({
        label: item.name,
        value: item.id
      }))
      setGradeOptions(options)
    } catch (e) {
      toast.error('Failed to load grades.')
    } finally {
      setLoadingGrades(false)
    }
  }

  const fetchPolishTypes = async () => {
    setLoadingPolishTypes(true)
    try {
      const response = await axiosInstance.get('/api/v1/admin/polishTypes/getAllPolishTypes?pageNo=0&limit=1000')
      const options = (response.data.data?.data ?? []).map((item: any) => ({
        label: item.name,
        value: item.id
      }))
      setPolishOptions(options)
    } catch (e) {
      toast.error('Failed to load polish types.')
    } finally {
      setLoadingPolishTypes(false)
    }
  }

  const fetchCategoriesByPlant = async (plantId: number | undefined): Promise<OptionItem[]> => {
    if (!plantId) {
      setCategoryOptions([])
      return []
    }
    setLoadingCategories(true)
    try {
      const response = await axiosInstance.get(`/api/v1/admin/categories/getAllCategories?plant_id=${plantId}&pageNo=0&limit=1000`)
      const options = (response.data.data?.data ?? []).map((item: any) => ({
        label: `${item.name}`,
        value: item.id
      }))
      setCategoryOptions(options)
      return options
    } catch (e) {
      toast.error('Failed to load categories.')
      return []
    } finally {
      setLoadingCategories(false)
    }
  }

  const fetchProductDetails = async (productId: number, shouldPrefill: boolean) => {
    try {
      const response = await axiosInstance.get(`/api/v1/admin/products/getProductsById/${productId}`)
      const rawData = response.data?.data
      const productData = rawData?.value ?? rawData

      if (!productData) {
        return
      }

      /*
      if (shouldPrefill) {
        let categoryId: number | undefined

        if (productData.categories?.id) {
          categoryId = Number(productData.categories.id)
        } else if (Array.isArray(productData.categories) && productData.categories.length) {
          categoryId = Number(productData.categories[0]?.id)
        } else if (productData.categories_id) {
          categoryId = Number(productData.categories_id)
        }

        if (categoryId && !Number.isNaN(categoryId)) {
          if (getNumericId(getValues('categories_id')) !== categoryId) {
            isSettingCategories.current = true
            setValue('categories_id', categoryId as any, { shouldValidate: true })
          }
        }
      }
      */

      if (shouldPrefill) {
        if (productData?.product_grades_id) {
          setValue('grade_id', Number(productData.product_grades_id), { shouldValidate: true })
        } else if (productData?.grade_id) {
          // Fallback if property name is different
          setValue('grade_id', Number(productData.grade_id), { shouldValidate: true })
        }

        if (productData?.polish_type_id) {
          setValue('polish_type_id', Number(productData.polish_type_id), { shouldValidate: true })
        }
        if (typeof productData?.default_moisture_content === 'number') {
          setValue('moisture_content', productData.default_moisture_content)
        }
        if (typeof productData?.default_purity === 'number') {
          setValue('purity', productData.default_purity)
        }
        if (typeof productData?.default_foreign_matter === 'number') {
          setValue('foreign_matter', productData.default_foreign_matter)
        }
        if (typeof productData?.default_packaging_kg === 'number') {
          setValue('packaging_kg', productData.default_packaging_kg)
        }
        if (typeof productData?.default_grain_size === 'number') {
          setValue('grain_size', productData.default_grain_size)
        }
      }
      if (typeof productData?.purity === 'number') {
        setValue('purity', productData.purity)
      }

      // Grain Size - convert to string as your form expects string
      if (productData?.grain_size !== null && productData?.grain_size !== undefined) {
        setValue('grain_size', String(productData.grain_size))
      }
      if (typeof productData?.description === 'string') {
        setValue('description', productData.description)
      }
    } catch (error) {
      toast.error('Failed to load product details.')
    }
  }

  useEffect(() => {
    if (open) {
      fetchPlants()
      fetchGrades()
      fetchPolishTypes()
    }
  }, [open])

  useEffect(() => {
    if (!open) {
      return
    }

    let resolvedId: number | undefined

    if (plantId !== undefined && plantId !== null) {
      if (typeof plantId === 'number') {
        resolvedId = plantId
      } else {
        try {
          const decoded = decodeParams(plantId)
          if (typeof decoded === 'number') {
            resolvedId = decoded
          } else if (decoded && typeof decoded === 'object' && 'id' in decoded) {
            resolvedId = Number(decoded.id)
          } else {
            resolvedId = Number(decoded ?? plantId)
          }
        } catch {
          resolvedId = Number(plantId)
        }
      }
    }

    if (resolvedId !== undefined && !Number.isNaN(resolvedId)) {
      setEffectivePlantId(resolvedId)
      setValue('plant_id', resolvedId, { shouldValidate: true, shouldDirty: true })
      fetchCategoriesByPlant(resolvedId)
    }
  }, [open, plantId, selectedItem, setValue])

  useEffect(() => {
    if (!selectedProductId || Number.isNaN(Number(selectedProductId))) {
      return
    }

    const numericProductId = getNumericId(selectedProductId)
    if (numericProductId) {
      fetchProductDetails(numericProductId, !selectedItem)
    }
  }, [selectedProductId, selectedItem])

  useEffect(() => {
    if (!selectedCategoryId) {
      setProductOptions([])
      setValue('product_id', undefined as any)
      return
    }

    if (isSettingCategories.current) {
      isSettingCategories.current = false
      // Don't reset product_id, but still fetch products for this category
      const numericCategoryId = getNumericId(selectedCategoryId)
      if (numericCategoryId) {
        fetchProductsByCategory(numericCategoryId)
      }
      return
    }

    const numericCategoryId = getNumericId(selectedCategoryId)
    if (!numericCategoryId || Number.isNaN(numericCategoryId)) {
      setProductOptions([])
      setValue('product_id', undefined as any)
      return
    }

    // Reset product_id when category changes manually
    setValue('product_id', undefined as any)
    fetchProductsByCategory(numericCategoryId)
  }, [selectedCategoryId, setValue])

  // Backup: Set categories_id after categoryOptions are loaded (fallback)
  useEffect(() => {
    if (!open) {
      return
    }

    if (selectedItem && categoryOptions.length > 0) {
      const currentCategoryId = selectedCategoryId ? Number(selectedCategoryId) : undefined

      // Get the expected category ID from selectedItem
      let categoryFromSelection = getSingleCategoryId(selectedItem.categories_id)
      if (categoryFromSelection === undefined) {
        categoryFromSelection = getSingleCategoryId(selectedItem.categories_ids)
      }

      // Only set if categories_id is not already set correctly OR if it doesn't match
      const needsUpdate = !currentCategoryId ||
        currentCategoryId === 0 ||
        Number.isNaN(currentCategoryId) ||
        (categoryFromSelection !== undefined && currentCategoryId !== categoryFromSelection)

      if (needsUpdate && categoryFromSelection !== undefined && !Number.isNaN(categoryFromSelection)) {
        // Verify the category exists in the options
        const categoryExists = categoryOptions.some(opt => opt.value === categoryFromSelection)
        if (categoryExists) {
          if (getNumericId(getValues('categories_id')) !== categoryFromSelection) {
            isSettingCategories.current = true
            setValue('categories_id', categoryFromSelection, { shouldValidate: true, shouldDirty: true, shouldTouch: true })
          }
        }
      }
    }
  }, [categoryOptions, selectedItem, selectedCategoryId, setValue, open])

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)

    try {
      const plantIdToUse = effectivePlantId ?? Number(data.plant_id)

      if (!plantIdToUse || isNaN(plantIdToUse)) {
        toast.error('Plant ID is required. Please ensure you are opening this form from a plant page.')
        setIsLoading(false)
        return
      }
      const extractId = (value: any): number | null => {
        if (value === null || value === undefined) return null
        if (typeof value === 'number') return value
        if (typeof value === 'object' && value.id) return Number(value.id)
        return Number(value)
      }
      // Build payload matching backend
      const payload = {
        plant_id: plantIdToUse,
        // categories_id: data.categories_id,
        // product_id: data.product_id,
        // grade_id: data.grade_id,
        categories_id: extractId(data.categories_id), // Extract ID
        product_id: extractId(data.product_id), // Extract ID
        grade_id: extractId(data.grade_id), // Extract ID
        custom_grade: data.custom_grade?.trim?.() ?? null,
        moisture_content: data.moisture_content ?? null,
        purity: data.purity ?? null,
        foreign_matter: data.foreign_matter ?? null,
        polish_type_id: extractId(data.polish_type_id), // Extract ID

        // polish_type_id: data.polish_type_id,
        custom_polish_type: data.custom_polish_type?.trim?.() ?? null,
        packaging_kg: data.packaging_kg ?? null,
        grain_size: data.grain_size ? String(data.grain_size) : null,
        description: data.description ?? null,
        min_order_quantity: data.min_order_quantity,
        price_per_unit: data.price_per_unit,
        price_unit: data.price_unit,
        current_stock: data.current_stock,
        stock_unit: data.stock_unit,
        is_available_for_sale: data.is_available_for_sale ? 1 : 0,
        notes: data.notes?.trim?.() ?? null
      }

      let url = ''
      if (selectedItem) {
        url = `/api/v1/admin/plantProducts/updatePlantProducts/${selectedItem.id}`
      } else {
        url = '/api/v1/admin/plantProducts/createPlantProducts'
      }
      const response = await axiosInstance.post(url, payload)
      if (response.data.success) {
        handleCloseModal()
        fetchData()
        // toast.success(selectedItem ? 'Product updated successfully.' : 'Product added successfully.')
        toast.success(response.data.message)
      } else {
        // Handle unexpected success:false responses
        toast.error(response.data.message ?? 'Server returned failure status.')
      }
    } catch (e: any) {
      toast.error(
        selectedItem
          ? e?.response?.data?.message ?? 'Failed to update product. Please try again.'
          : e?.response?.data?.message ?? 'Failed to add product. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!open) {
      return
    }

    if (selectedItem) {
      const plantIdToUse = selectedItem?.plant_id ?? effectivePlantId

      if (plantIdToUse) {
        setEffectivePlantId(plantIdToUse)
        setValue('plant_id', plantIdToUse, { shouldValidate: true, shouldDirty: true })

        // Fetch categories first, then fetch product details to get category, then set all values
        fetchCategoriesByPlant(plantIdToUse).then(async (loadedOptions) => {
          // Fetch product details to get the category, grade, and polish type if missing
          let categoryFromSelection = getSingleCategoryId(selectedItem.categories_id)
          if (categoryFromSelection === undefined) {
            categoryFromSelection = getSingleCategoryId(selectedItem.categories_ids)
          }

          let gradeIdFromProduct: number | undefined;
          let polishTypeIdFromProduct: number | undefined;

          // If category, grade, or polish type is missing, fetch from product details
          const needsProductDetails =
            (categoryFromSelection === undefined || Number.isNaN(categoryFromSelection)) ||
            !selectedItem?.grade_id ||
            !selectedItem?.polish_type_id;



          if (needsProductDetails && selectedItem?.product_id) {
            try {
              const response = await axiosInstance.get(`/api/v1/admin/products/getProductsById/${selectedItem.product_id}`)
              const rawData = response.data?.data
              const productData = rawData?.value ?? rawData



              if (productData) {
                // Category extraction
                if (productData.categories) {
                  categoryFromSelection = productData.categories
                } else if (Array.isArray(productData.categories) && productData.categories.length) {
                  categoryFromSelection = productData.categories[0]
                } else if (productData.categories_id) {
                  categoryFromSelection = Number(productData.categories_id)
                }

                // Grade extraction
                if (productData.product_grades_id) {
                  gradeIdFromProduct = Number(productData.product_grades_id);
                }

                // Polish Type extraction
                if (productData.polish_type_id) {
                  polishTypeIdFromProduct = Number(productData.polish_type_id);
                }
              }
            } catch (error) {
              }
          }

          // Set all form values after categories are loaded
          // Helper to check object vs ID
          const setObjOrId = (field: any, obj: any, id: any) => {
            setValue(field, obj ?? id ?? (undefined as any), { shouldValidate: true })
          }

          const getValidId = (val: any) => {
            const num = Number(val);
            return (val && !Number.isNaN(num) && num > 0) ? num : undefined;
          };

          setObjOrId('product_id', selectedItem?.product, selectedItem?.product_id)

          // For grade and polish, use IDs as they are local options with valueKey="value"
          const gradeIdToSet = getValidId(selectedItem?.grade_id) ?? gradeIdFromProduct;
          setValue('grade_id', gradeIdToSet as any, { shouldValidate: true })

          const polishIdToSet = getValidId(selectedItem?.polish_type_id) ?? polishTypeIdFromProduct;
          setValue('polish_type_id', polishIdToSet as any, { shouldValidate: true })

          setValue('custom_grade', selectedItem?.custom_grade ?? null)
          setValue('moisture_content', selectedItem?.moisture_content ?? null)
          setValue('purity', selectedItem?.purity ?? null)
          setValue('foreign_matter', selectedItem?.foreign_matter ?? null)
          setValue('custom_polish_type', selectedItem?.custom_polish_type ?? null)
          setValue('packaging_kg', selectedItem?.packaging_kg ?? null)
          setValue('grain_size', selectedItem?.grain_size ?? null)
          setValue('min_order_quantity', selectedItem?.min_order_quantity ?? 1)
          setValue('price_per_unit', selectedItem?.price_per_unit ?? 0)
          setValue('price_unit', selectedItem?.price_unit ?? 1)
          setValue('current_stock', selectedItem?.current_stock ?? 0)
          setValue('stock_unit', selectedItem?.stock_unit ?? 1)
          setValue(
            'is_available_for_sale',
            typeof selectedItem?.is_available_for_sale === 'boolean'
              ? selectedItem.is_available_for_sale
              : selectedItem?.is_available_for_sale === 1,
            { shouldValidate: true }
          )
          setValue('notes', selectedItem?.notes ?? null)

          // Set categories_id
          const catToSet = selectedItem.categories || categoryFromSelection;
          if (catToSet) {
            const currentCatId = getNumericId(getValues('categories_id'));
            const newCatId = getNumericId(catToSet);
            if (currentCatId !== newCatId) {
              isSettingCategories.current = true
              setValue('categories_id', catToSet as any, { shouldValidate: true, shouldDirty: true });
            }
          }
        })
      } else {
        // If no plantId (add mode or strange state), just set what we can, though logic suggests we need plantID.
        // Copy of above logic with minor adjustments would be ideal, but for brevity keeping close to original flow
        const setObjOrId = (field: any, obj: any, id: any) => {
          setValue(field, obj ?? id ?? (undefined as any), { shouldValidate: true })
        }
        setObjOrId('product_id', selectedItem?.product, selectedItem?.product_id)
        setObjOrId('grade_id', selectedItem?.grade, selectedItem?.grade_id)
        setObjOrId('polish_type_id', selectedItem?.polish_type, selectedItem?.polish_type_id)

        setValue('custom_grade', selectedItem?.custom_grade ?? null)
        setValue('moisture_content', selectedItem?.moisture_content ?? null)
        setValue('purity', selectedItem?.purity ?? null)
        setValue('foreign_matter', selectedItem?.foreign_matter ?? null)
        setValue('custom_polish_type', selectedItem?.custom_polish_type ?? null)
        setValue('packaging_kg', selectedItem?.packaging_kg ?? null)
        setValue('grain_size', selectedItem?.grain_size ?? null)
        setValue('description', selectedItem?.description ?? null)
        setValue('min_order_quantity', selectedItem?.min_order_quantity ?? 1)
        setValue('price_per_unit', selectedItem?.price_per_unit ?? 0)
        setValue('price_unit', selectedItem?.price_unit ?? 1)
        setValue('current_stock', selectedItem?.current_stock ?? 0)
        setValue('stock_unit', selectedItem?.stock_unit ?? 1)
        setValue(
          'is_available_for_sale',
          typeof selectedItem?.is_available_for_sale === 'boolean'
            ? selectedItem.is_available_for_sale
            : selectedItem?.is_available_for_sale === 1,
          { shouldValidate: true }
        )
        setValue('notes', selectedItem?.notes ?? null)

        if (selectedItem.product?.categories) {
          if (getNumericId(getValues('categories_id')) !== getNumericId(selectedItem.product.categories)) {
            isSettingCategories.current = true
            setValue('categories_id', selectedItem.product.categories, { shouldValidate: true, shouldDirty: true });
          }
        }
      }
    } else {
      reset(defaultValues)
      // Reset effectivePlantId when form is cleared
      if (plantId !== undefined && plantId !== null) {
        let resolvedId: number | undefined
        if (typeof plantId === 'number') {
          resolvedId = plantId
        } else {
          try {
            const decoded = decodeParams(plantId)
            if (typeof decoded === 'number') {
              resolvedId = decoded
            } else if (decoded && typeof decoded === 'object' && 'id' in decoded) {
              resolvedId = Number(decoded.id)
            } else {
              resolvedId = Number(decoded ?? plantId)
            }
          } catch {
            resolvedId = Number(plantId)
          }
        }
        if (resolvedId !== undefined && !Number.isNaN(resolvedId)) {
          setEffectivePlantId(resolvedId)
          setValue('plant_id', resolvedId, { shouldValidate: true, shouldDirty: true })
        }
      }
    }
  }, [selectedItem, reset, setValue, effectivePlantId, plantId, open])

  const handleCloseModal = () => {
    reset(defaultValues)
    handleClose()
  }

  return (
    <Dialog
      open={open}
      onClose={handleCloseModal}
      aria-labelledby='dialog-title'
      aria-describedby='dialog-description'
      maxWidth={'md'}
      fullWidth
      disableEnforceFocus={true}
    >
      <DialogTitle
        sx={{
          m: 0,
          p: 2,
          fontWeight: 'bold',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#3A4E7C0F'
        }}
        id='customized-dialog-title'
      >
        <Toaster position='top-right' reverseOrder={false} />
        <Typography sx={{ fontSize: '25px', fontWeight: 'bold', textAlign: 'Start', flexGrow: 1, paddingLeft: '10px' }}>
          {selectedItem ? 'Update' : 'Add'} Existing Product{' '}
        </Typography>
        <IconButton onClick={handleCloseModal}>
          <HighlightOffIcon sx={{ color: '#f52d2de0' }} fontSize='large' />
        </IconButton>
      </DialogTitle>
      <form
        onSubmit={handleSubmit(onSubmit, errors => {
          toast.error('Please fill in all required fields correctly.')
        })}
      >
        <DialogContent dividers>
          <Grid container spacing={2}>
            {/* {Object.keys(errors).length > 0 && (
              <Grid item xs={12}>
                <Typography variant='body2' color='error' sx={{ mb: 1 }}>
                  Validation Errors: {JSON.stringify(Object.keys(errors))}
                </Typography>
              </Grid>
            )} */}

            <Grid item xs={12} md={6}>

              <RHFAutoComplete
                control={control}
                name="categories_id"
                // options={categories}
                placeholder="Select Category"
                labelinput="Select Category"
                // loading={loadingCategories}
                apiUrl="/api/v1/admin/categories/getAllCategories"
                extraParams={{ plant_id: plantId, is_active: 1 }}
                labelKey="name"
                valueKey="id" required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <RHFAutoComplete
                control={control}
                name='product_id'
                // options={productOptions}
                placeholder='Select Product'
                labelinput='Select Product'
                // loading={loadingProducts}
                apiUrl={selectedCategoryId && '/api/v1/admin/products/getAllProducts'}
                extraParams={{ plant_id: plantId, categories_id: selectedCategoryId, is_active: 1 }}

                labelKey="name"
                valueKey="id"
                required


              />
            </Grid>

            <Grid item xs={12} md={6}>
              <RHFAutoComplete
                control={control}
                name='grade_id'
                // @ts-ignore
                options={gradeOptions}
                placeholder='Select Product Grade'
                labelinput='Select Product Grade'
                // apiUrl="/api/v1/admin/productGrades/getAllProductGrades"
                // extraParams={{ is_active: 1 }}
                labelKey="label"
                valueKey="value"
                required


              />
            </Grid>

            <Grid item xs={12} md={6}>
              <RHFAutoComplete
                control={control}
                name='polish_type_id'
                // @ts-ignore
                options={polishOptions}
                placeholder='Select Polish Type'
                labelinput='Select Polish Type'
                // apiUrl="/api/v1/admin/polishTypes/getAllPolishTypes"
                // extraParams={{ is_active: 1 }}
                labelKey="label"
                valueKey="value"
                required


              />
            </Grid>

            {/* <Grid item xs={12} md={6}>
              <RHFInput control={control} name={'custom_grade'} label={'Custom Grade'} placeholder={'Premium'} />
            </Grid> */}



            <Grid item xs={12} md={4}>
              <RHFNumberInput control={control} name='moisture_content' label='Moisture Level (%)' placeholder='Moisture Level (%)' min={0} max={100} decimalScale={2} />
            </Grid>

            <Grid item xs={12} md={4}>
              <RHFNumberInput control={control} name='purity' label='Purity (%)' placeholder='Purity (%)' min={0} max={100} decimalScale={2} />
            </Grid>

            <Grid item xs={12} md={4}>
              <RHFNumberInput control={control} name='foreign_matter' label='Foreign Matter (%)' placeholder='Foreign Matter (%)' min={0} max={100} decimalScale={2} />
            </Grid>

            {/* <Grid item xs={12} md={6}>
              <RHFInput control={control} name={'custom_polish_type'} label={'Custom Polish Type'} placeholder={'Double Polish'} />
            </Grid> */}

            <Grid item xs={12} md={6}>
              <RHFNumberInput control={control} name='packaging_kg' label='Packaging (kg)' placeholder='Packaging (kg)' min={0} />
            </Grid>

            <Grid item xs={12} md={6}>
              <RHFNumberInput control={control} name='grain_size' label='Grain Size (MM)' placeholder='Grain Size (MM)' min={0} />
            </Grid>

            {/* <Grid item xs={12} md={6}>
              <RHFNumberInput control={control} name='min_order_quantity' label='Min Order Quantity' placeholder='10' min={0} />
            </Grid>

            <Grid item xs={12} md={6}>
              <RHFNumberInput control={control} name='price_per_unit' label='Price Per Unit' placeholder='75' min={0} decimalScale={2} />
            </Grid>

            <Grid item xs={12} md={6}>
              <RHFNumberInput control={control} name='price_unit' label='Price Unit (id)' placeholder='1' min={0} />
            </Grid>

            <Grid item xs={12} md={6}>
              <RHFNumberInput control={control} name='current_stock' label='Current Stock' placeholder='500' min={0} />
            </Grid>

            <Grid item xs={12} md={6}>
              <RHFNumberInput control={control} name='stock_unit' label='Stock Unit (id)' placeholder='1' min={0} />
            </Grid>

            <Grid item xs={12}>
              <RHFInput control={control} name={'notes'} label={'Notes'} placeholder={'Fresh Stock'} multiline rows={3} />
            </Grid> */}
            <Grid item xs={12}>
              <RHFInput control={control} name={'description'} label={'Description'} placeholder={'Description'} multiline rows={3} mandatory={false} />
            </Grid>
            {selectedItem && (
              <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center' }}>
                <Box>
                  <Controller
                    name='is_available_for_sale'
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Switch checked={field.value} onChange={event => field.onChange(event.target.checked)} color='primary' />}
                        label={field.value ? 'Available for Sale' : 'Not Available'}
                      />
                    )}
                  />
                  {errors.is_available_for_sale && (
                    <FormHelperText sx={{ color: 'error.main', ml: 1 }}>{errors.is_available_for_sale.message}</FormHelperText>
                  )}
                </Box>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ mt: 3 }}>
          <Button variant='outlined' onClick={handleCloseModal}>
            Cancel
          </Button>
          <SubmitButton label='Submit' isLoading={isLoading} onSubmit={handleSubmit(onSubmit)} isWidth={false} />
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default AddProductPlant
