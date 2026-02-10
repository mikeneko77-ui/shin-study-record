import { useEffect, useState } from "react";
import type { Record } from "./domain/record";

import {
  Button,
  Container,
  Heading,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import {
  selectAllRecords,
  insertRecord,
  deleteRecord,
  updateRecord,
} from "./utils/supabase";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { RecordTable } from "./components/RecordTable";
import { TotalTime } from "./components/TotalTime";
import { RecordModal } from "./components/RecordModal";

function App() {
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRecord, setEditingRecord] = useState<Record | null>(null);
  const { open, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true);
      try {
        const data = await selectAllRecords();
        setRecords(data);
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, []);

  // 新規登録ボタンのハンドラ
  const handleOpenAddModal = () => {
    setEditingRecord(null);
    onOpen();
  };

  // 編集ボタンのハンドラ
  const handleOpenEditModal = (record: Record) => {
    setEditingRecord(record);
    onOpen();
  };

  // モーダルを閉じるハンドラ
  const handleCloseModal = () => {
    setEditingRecord(null);
    onClose();
  };

  // 登録・更新処理
  const handleSubmit = async (title: string, time: number) => {
    if (editingRecord) {
      // 編集モード
      const updatedRecord = await updateRecord(editingRecord.id, title, time);
      if (updatedRecord) {
        setRecords(
          records.map((r) => (r.id === editingRecord.id ? updatedRecord : r))
        );
      }
    } else {
      // 新規登録モード
      const newRecord = await insertRecord(title, time);
      if (newRecord) {
        setRecords([...records, newRecord]);
      }
    }
  };

  const handleDeleteRecord = async (id: string) => {
    const success = await deleteRecord(id);
    if (success) {
      setRecords(records.filter((record) => record.id != id));
    } else {
      throw new Error("削除に失敗しました");
    }
  };

  return (
    <Container maxW="container.md" py={8}>
      <VStack gap={6} align="stretch">
        <Heading as="h1" size="xl" textAlign="center">
          学習記録アプリ
        </Heading>
        <Button
          colorPalette="blue"
          onClick={handleOpenAddModal}
          bg="blue.500"
          color="white"
          _hover={{ bg: "blue.600" }}
        >
          新規登録
        </Button>
        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            <RecordTable
              records={records}
              onDelete={handleDeleteRecord}
              onEdit={handleOpenEditModal}
            />
            <TotalTime records={records} />
          </>
        )}
        <RecordModal
          open={open}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          editRecord={editingRecord}
        />
      </VStack>
    </Container>
  );
}

export default App;
