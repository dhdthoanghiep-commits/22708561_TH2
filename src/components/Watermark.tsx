import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { STUDENT, VARIANT, examStamp } from '@constants/student';
import { COLORS, SIZES } from '@constants/theme';

/** Dòng tên bắt buộc trên mọi màn chính: TH2 · {mssv} · {hoTen} · #{examStamp()} */
export const WATERMARK_TEXT = `TH2 · ${STUDENT.mssv} · ${STUDENT.hoTen} · #${examStamp()}`;

interface Props {
  /**
   * Mỗi màn đặt <Watermark position="top" /> ở đầu và <Watermark position="bottom" /> ở cuối;
   * component tự chỉ hiện ĐÚNG 1 chỗ theo VARIANT.watermarkAtTop (số cuối chẵn = Trên, lẻ = Dưới).
   */
  position: 'top' | 'bottom';
}

const Watermark = ({ position }: Props) => {
  const visible =
    position === 'top' ? VARIANT.watermarkAtTop : !VARIANT.watermarkAtTop;
  if (!visible) {
    return null;
  }
  return (
    <View
      style={[styles.bar, position === 'top' ? styles.top : styles.bottom]}
      accessibilityLabel={WATERMARK_TEXT}>
      <Text style={styles.text} numberOfLines={1} adjustsFontSizeToFit>
        {WATERMARK_TEXT}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    backgroundColor: COLORS.border,
    paddingVertical: 6,
    paddingHorizontal: SIZES.base,
    alignItems: 'center',
  },
  top: { borderBottomWidth: 1, borderBottomColor: COLORS.primary },
  bottom: { borderTopWidth: 1, borderTopColor: COLORS.primary },
  text: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});

export default memo(Watermark);
