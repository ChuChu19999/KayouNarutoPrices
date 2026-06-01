import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Form, Input, InputNumber, message, Modal, Upload } from 'antd';
import { BiCheckCircle, BiImageAdd } from 'react-icons/bi';
import { getProductImageSrc } from '../../../shared/api/products';
import type { Product, ProductPayload } from '../../../shared/api/products';
import type { UploadChangeParam, UploadFile } from 'antd/es/upload/interface';
import './ProductFormModal.css';

export type ProductFormMode = 'create' | 'edit';

interface ProductFormModalProps {
  open: boolean;
  formSession: number;
  mode: ProductFormMode;
  product?: Product | null;
  loading?: boolean;
  onCancel: () => void;
  onSubmit: (payload: ProductPayload) => void;
}

interface ProductFormContentProps {
  mode: ProductFormMode;
  product?: Product | null;
  onSubmit: (payload: ProductPayload) => void;
  onRegisterSubmit: (submit: () => Promise<void>) => void;
}

interface ProductFormValues {
  name: string;
  price: number;
  productUrl: string;
}

const httpsRule = {
  validator: (_: unknown, value: string) => {
    if (!value || value.trim().toLowerCase().startsWith('https://')) {
      return Promise.resolve();
    }
    return Promise.reject(new Error('Ссылка должна начинаться с https://'));
  },
};

const revokeBlobUrl = (url?: string) => {
  if (url?.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
};

const ProductFormContent = ({
  mode,
  product,
  onSubmit,
  onRegisterSubmit,
}: ProductFormContentProps) => {
  const [form] = Form.useForm<ProductFormValues>();
  const [newImageFile, setNewImageFile] = useState<File | undefined>();
  const [previewUrl, setPreviewUrl] = useState<string | undefined>();

  useEffect(
    () => () => {
      revokeBlobUrl(previewUrl);
    },
    [previewUrl]
  );

  const clearImageState = useCallback(() => {
    setPreviewUrl(prev => {
      revokeBlobUrl(prev);
      return undefined;
    });
    setNewImageFile(undefined);
  }, []);

  const uploadFileList: UploadFile[] = useMemo(() => {
    if (newImageFile && previewUrl) {
      return [
        {
          uid: 'new-image',
          name: newImageFile.name,
          status: 'done',
          url: previewUrl,
          thumbUrl: previewUrl,
        },
      ];
    }
    if (mode === 'edit' && product?.hasImage && !newImageFile) {
      const existingSrc = getProductImageSrc(product);
      if (existingSrc) {
        return [
          {
            uid: String(product.id),
            name: 'Текущее изображение',
            status: 'done',
            url: existingSrc,
            thumbUrl: existingSrc,
          },
        ];
      }
    }
    return [];
  }, [newImageFile, previewUrl, mode, product]);

  const handleUploadChange = (info: UploadChangeParam<UploadFile>) => {
    const latest = info.fileList.slice(-1);

    if (latest.length === 0) {
      clearImageState();
      return;
    }

    const file = latest[0];
    const origin = file.originFileObj;
    if (!origin) {
      return;
    }

    revokeBlobUrl(previewUrl);
    const objectUrl = URL.createObjectURL(origin);
    setPreviewUrl(objectUrl);
    setNewImageFile(origin);
  };

  const handleRemove = () => {
    clearImageState();
    return true;
  };

  const handleSubmit = useCallback(async () => {
    const values = await form.validateFields();

    if (mode === 'create' && !newImageFile) {
      message.error('Загрузите изображение');
      return;
    }

    onSubmit({
      name: values.name.trim(),
      price: values.price,
      productUrl: values.productUrl.trim(),
      imageFile: newImageFile,
    });
  }, [form, mode, newImageFile, onSubmit]);

  useEffect(() => {
    onRegisterSubmit(handleSubmit);
  }, [handleSubmit, onRegisterSubmit]);

  const uploadStatusText = useMemo(() => {
    if (newImageFile) {
      return `Загружено: ${newImageFile.name}`;
    }
    if (mode === 'edit' && product?.hasImage && uploadFileList.length > 0) {
      return 'Используется текущее изображение товара';
    }
    return null;
  }, [newImageFile, mode, product?.hasImage, uploadFileList.length]);

  const initialValues =
    mode === 'edit' && product
      ? {
          name: product.name,
          price: Number(product.price),
          productUrl: product.productUrl,
        }
      : undefined;

  const imageField = (
    <Form.Item
      label="Изображение"
      required={mode === 'create'}
      help={mode === 'edit' ? 'Оставьте текущее или загрузите новое' : undefined}
    >
      <Upload
        accept="image/jpeg,image/png,image/webp,image/gif"
        listType="picture-card"
        maxCount={1}
        fileList={uploadFileList}
        beforeUpload={() => false}
        onChange={handleUploadChange}
        onRemove={handleRemove}
        showUploadList={{ showPreviewIcon: true, showRemoveIcon: true }}
      >
        {uploadFileList.length === 0 && (
          <div className="product-form-modal__upload-placeholder">
            <BiImageAdd size={24} />
            <span>Загрузить</span>
          </div>
        )}
      </Upload>
      {uploadStatusText && (
        <p
          className={
            newImageFile
              ? 'product-form-modal__upload-status product-form-modal__upload-status--new'
              : 'product-form-modal__upload-status'
          }
        >
          {newImageFile && <BiCheckCircle size={16} aria-hidden />}
          {uploadStatusText}
        </p>
      )}
    </Form.Item>
  );

  return (
    <Form
      form={form}
      layout="vertical"
      className="product-form-modal__form"
      initialValues={initialValues}
    >
      <Form.Item
        label="Наименование"
        name="name"
        rules={[
          { required: true, message: 'Укажите наименование' },
          { max: 20, message: 'Не более 20 символов' },
        ]}
      >
        <Input maxLength={20} showCount autoFocus={mode === 'create'} />
      </Form.Item>
      {imageField}
      <Form.Item label="Цена, ₽" name="price" rules={[{ required: true, message: 'Укажите цену' }]}>
        <InputNumber min={0} precision={2} className="product-form-modal__price" />
      </Form.Item>
      <Form.Item
        label="Ссылка на товар"
        name="productUrl"
        rules={[{ required: true, message: 'Укажите ссылку' }, httpsRule]}
      >
        <Input placeholder="https://..." />
      </Form.Item>
    </Form>
  );
};

const ProductFormModal = ({
  open,
  formSession,
  mode,
  product,
  loading,
  onCancel,
  onSubmit,
}: ProductFormModalProps) => {
  const submitRef = useRef<(() => Promise<void>) | null>(null);

  const registerSubmit = useCallback((submit: () => Promise<void>) => {
    submitRef.current = submit;
  }, []);

  const title = mode === 'create' ? 'Добавить товар' : 'Редактировать товар';

  return (
    <Modal
      title={title}
      open={open}
      centered
      onCancel={onCancel}
      onOk={() => void submitRef.current?.()}
      okText={mode === 'create' ? 'Добавить' : 'Сохранить'}
      cancelText="Отмена"
      confirmLoading={loading}
      destroyOnHidden
      className="product-form-modal"
      classNames={{ wrapper: 'product-form-modal-wrap' }}
      width={480}
    >
      {open ? (
        <ProductFormContent
          key={`${mode}-${formSession}`}
          mode={mode}
          product={product}
          onSubmit={onSubmit}
          onRegisterSubmit={registerSubmit}
        />
      ) : null}
    </Modal>
  );
};

export default ProductFormModal;
