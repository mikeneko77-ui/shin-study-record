import { Table, Text, IconButton, HStack } from "@chakra-ui/react";
import { formatTime, type Record } from "../domain/record";
import { FiTrash2, FiEdit } from "react-icons/fi";

type RecordTableProps = {
  records: Record[];
  onDelete: (id: string) => Promise<void>;
  onEdit: (record: Record) => void;
};

export const RecordTable = ({
  records,
  onDelete,
  onEdit,
}: RecordTableProps) => {
  if (records.length == 0) {
    return (
      <Text color="gray.500" textAlign="center" py={8}>
        学習記録がありません
      </Text>
    );
  }

  return (
    <Table.Root>
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeader>学習内容</Table.ColumnHeader>
          <Table.ColumnHeader textAlign="end">学習時間</Table.ColumnHeader>
          <Table.ColumnHeader>操作</Table.ColumnHeader>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {records.map((record) => (
          <Table.Row key={record.id}>
            <Table.Cell>{record.title}</Table.Cell>
            <Table.Cell textAlign="end">{formatTime(record.time)}</Table.Cell>
            <Table.Cell>
              <HStack gap={2}>
                <IconButton
                  aria-label="編集"
                  colorPalette="blue"
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(record)}
                >
                  <FiEdit />
                </IconButton>
                <IconButton
                  aria-label="削除"
                  colorPalette="red"
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(record.id)}
                >
                  <FiTrash2 />
                </IconButton>
              </HStack>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
};
