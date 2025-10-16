import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@nextui-org/react";

const AGREEMENT_TEXT = `
# 用户协议及免责声明

## 1. 协议接受
使用本平台即表示您已充分阅读、理解并同意遵守本协议的所有条款。如果您不同意本协议的任何部分，请立即停止使用本平台。

## 2. 风险承担
- 用户完全理解并同意承担使用本平台进行交易的所有风险
- 平台不对任何交易的真实性、合法性承担责任
- 用户应自行判断交易的真实性和风险

## 3. 免责声明
- 平台不承担因用户操作失误导致的任何损失
- 平台不对任何交易纠纷承担责任
- 因不可抗力导致的损失，平台不承担责任

## 4. 用户责任
- 用户应确保提供信息的真实性和准确性
- 用户应遵守相关法律法规
- 用户应妥善保管账户信息

## 5. 处罚措施
如发现违规行为，平台有权：
- 立即终止服务
- 永久封禁账号
- 追究法律责任

## 6. 最终解释
本平台保留对本协议的最终解释权
`;

interface Props {
    isOpen: boolean;
    onAccept: () => void;
    onReject: () => void;
}

export default function AgreementModal({ isOpen, onAccept, onReject }: Props) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onReject}
            size="2xl"
            isDismissable={false}
            hideCloseButton
        >
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1">用户协议</ModalHeader>
                <ModalBody>
                    <div className="prose dark:prose-invert max-h-[60vh] overflow-y-auto">
                        <div className="whitespace-pre-wrap text-sm">
                            {AGREEMENT_TEXT}
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button color="danger" variant="light" onPress={onReject}>
                        不同意
                    </Button>
                    <Button color="primary" onPress={onAccept}>
                        同意并继续
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
} 