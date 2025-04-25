import { useState } from "react";
import {
  Typography,
  Row,
  Col,
  Button,
  Input,
  notification,
  Spin,
  Space,
  Modal,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BOMCard } from "../components/bom/BOMCard";
import { BOMForm } from "../components/bom/BOMForm";
import { BOMDetails } from "../components/bom/BOMDetails";
import { bomApi } from "../services/bomService";
import { BOM, BOMInput } from "../types/bom";

const { Title } = Typography;
const { Search } = Input;

export default function BOMPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedBOM, setSelectedBOM] = useState<BOM | undefined>();
  const [formOpen, setFormOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Queries
  const { data: boms, isLoading } = useQuery({
    queryKey: ["boms", search],
    queryFn: () => bomApi.getBOMs(search),
  });

  // Mutations
  const createBOM = useMutation({
    mutationFn: bomApi.createBOM,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boms"] });
      notification.success({ message: t("bom.createSuccess") });
      handleCloseForm();
    },
    onError: () => {
      notification.error({ message: t("common.error") });
    },
  });

  const updateBOM = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BOMInput> }) =>
      bomApi.updateBOM(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boms"] });
      notification.success({ message: t("bom.updateSuccess") });
      handleCloseForm();
    },
    onError: () => {
      notification.error({ message: t("common.error") });
    },
  });

  const deleteBOM = useMutation({
    mutationFn: bomApi.deleteBOM,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boms"] });
      notification.success({ message: t("bom.deleteSuccess") });
    },
    onError: () => {
      notification.error({ message: t("common.error") });
    },
  });

  // Event Handlers
  const handleAddBOM = () => {
    setSelectedBOM(undefined);
    setFormOpen(true);
  };

  const handleEditBOM = (bom: BOM) => {
    setSelectedBOM(bom);
    setFormOpen(true);
  };

  const handleViewBOM = (bom: BOM) => {
    setSelectedBOM(bom);
    setDetailsOpen(true);
  };

  const handleDeleteBOM = (bom: BOM) => {
    Modal.confirm({
      title: t("bom.deleteConfirmation"),
      onOk: () => deleteBOM.mutate(bom.id),
    });
  };

  const handleSubmitBOM = (bomData: BOMInput) => {
    if (selectedBOM) {
      updateBOM.mutate({
        id: selectedBOM.id,
        data: bomData,
      });
    } else {
      createBOM.mutate(bomData);
    }
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setSelectedBOM(undefined);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedBOM(undefined);
  };

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Title level={2}>{t("bom.title")}</Title>

        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddBOM}>
          {t("bom.addBom")}
        </Button>
      </div>

      {/* Search */}
      <Row>
        <Col xs={24} md={12} lg={8}>
          <Search
            placeholder={t("common.search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
          />
        </Col>
      </Row>

      {/* BOMs Grid */}
      {isLoading ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <Spin size="large" />
        </div>
      ) : (
        <Row gutter={[16, 16]}>
          {boms?.map((bom: BOM) => (
            <Col xs={24} md={12} lg={8} key={bom.id}>
              <BOMCard
                bom={bom}
                onView={handleViewBOM}
                onEdit={handleEditBOM}
                onDelete={handleDeleteBOM}
              />
            </Col>
          ))}
        </Row>
      )}

      {/* BOM Form Modal */}
      <BOMForm
        open={formOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmitBOM}
        initialData={selectedBOM}
      />

      {/* BOM Details Modal */}
      {selectedBOM && detailsOpen && (
        <BOMDetails
          open={detailsOpen}
          onClose={handleCloseDetails}
          bom={selectedBOM}
        />
      )}
    </Space>
  );
}
