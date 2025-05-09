import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { paymentService } from "../services/paymentService";
import { subscriptionPlansStorage } from "../services/storage";
import { SubscriptionPlan } from "../types";

export const SubscriptionScreen = () => {
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<{
    isPremium: boolean;
    expiryDate?: Date;
    currentPlan?: SubscriptionPlan;
  }>({ isPremium: false });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // 구독 플랜 가져오기
      const availablePlans = await subscriptionPlansStorage.getPlans();
      setPlans(availablePlans);

      // 현재 구독 상태 가져오기
      const status = await paymentService.checkSubscriptionStatus();
      setSubscriptionStatus(status);

      // 이미 구독 중이면 현재 플랜 ID를 선택 상태로 설정
      if (status.currentPlan) {
        setSelectedPlanId(status.currentPlan.id);
      } else {
        // 구독 중이 아니면 첫 번째 플랜 선택
        setSelectedPlanId(availablePlans[0]?.id || null);
      }
    } catch (error) {
      console.error("구독 데이터 로드 중 오류 발생:", error);
      Alert.alert("오류", "구독 정보를 불러오는 중 문제가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (planId: string) => {
    setSelectedPlanId(planId);
  };

  const handleSubscribe = async () => {
    if (!selectedPlanId) {
      Alert.alert("알림", "구독 플랜을 선택해주세요.");
      return;
    }

    try {
      setLoading(true);

      // 결제 요청
      await paymentService.requestPayment(selectedPlanId);

      // 참고: 실제 결제 완료는 결제 SDK에서 처리하여 successUrl로 리디렉션됨
    } catch (error) {
      console.error("구독 결제 중 오류 발생:", error);
      Alert.alert(
        "오류",
        "결제 처리 중 문제가 발생했습니다. 다시 시도해주세요."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      "구독 취소",
      "정말로 구독을 취소하시겠습니까? 남은 구독 기간 동안에는 계속 프리미엄 혜택을 이용하실 수 있습니다.",
      [
        { text: "아니오", style: "cancel" },
        {
          text: "취소",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await paymentService.cancelSubscription();
              await loadData(); // 데이터 다시 로드
              Alert.alert("완료", "구독이 취소되었습니다.");
            } catch (error) {
              console.error("구독 취소 중 오류 발생:", error);
              Alert.alert(
                "오류",
                "구독 취소 중 문제가 발생했습니다. 다시 시도해주세요."
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const formatDate = (date?: Date) => {
    if (!date) return "";
    return `${date.getFullYear()}년 ${
      date.getMonth() + 1
    }월 ${date.getDate()}일`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200EE" />
        <Text style={styles.loadingText}>구독 정보를 불러오는 중...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 구독 상태 정보 */}
        <View style={styles.statusCard}>
          <Ionicons
            name={
              subscriptionStatus.isPremium
                ? "checkmark-circle"
                : "close-circle-outline"
            }
            size={32}
            color={subscriptionStatus.isPremium ? "#4CAF50" : "#999"}
          />
          <Text style={styles.statusTitle}>
            {subscriptionStatus.isPremium ? "프리미엄 사용자" : "일반 사용자"}
          </Text>
          {subscriptionStatus.isPremium && subscriptionStatus.expiryDate && (
            <Text style={styles.statusInfo}>
              구독 만료일: {formatDate(subscriptionStatus.expiryDate)}
            </Text>
          )}
          {subscriptionStatus.isPremium && subscriptionStatus.currentPlan && (
            <Text style={styles.statusInfo}>
              현재 플랜: {subscriptionStatus.currentPlan.name}
            </Text>
          )}
        </View>

        {/* 프리미엄 혜택 */}
        <View style={styles.benefitsCard}>
          <Text style={styles.benefitsTitle}>프리미엄 혜택</Text>
          <View style={styles.benefitItem}>
            <Ionicons name="remove-circle-outline" size={24} color="#6200EE" />
            <Text style={styles.benefitText}>모든 광고 제거</Text>
          </View>
          <View style={styles.benefitItem}>
            <Ionicons name="star-outline" size={24} color="#6200EE" />
            <Text style={styles.benefitText}>고급 리뷰 템플릿 이용</Text>
          </View>
          <View style={styles.benefitItem}>
            <Ionicons name="infinite-outline" size={24} color="#6200EE" />
            <Text style={styles.benefitText}>무제한 컬렉션 생성</Text>
          </View>
          <View style={styles.benefitItem}>
            <Ionicons name="people-outline" size={24} color="#6200EE" />
            <Text style={styles.benefitText}>프리미엄 커뮤니티 액세스</Text>
          </View>
        </View>

        {/* 구독 플랜 선택 */}
        {!subscriptionStatus.isPremium && (
          <>
            <Text style={styles.sectionTitle}>구독 플랜 선택</Text>
            <View style={styles.plansContainer}>
              {plans.map((plan) => (
                <TouchableOpacity
                  key={plan.id}
                  style={[
                    styles.planCard,
                    selectedPlanId === plan.id && styles.selectedPlanCard,
                  ]}
                  onPress={() => handleSelectPlan(plan.id)}
                >
                  <View style={styles.planHeader}>
                    <Text style={styles.planName}>{plan.name}</Text>
                    <View style={styles.priceContainer}>
                      <Text style={styles.planPrice}>
                        {plan.price.toLocaleString()}원
                      </Text>
                      {plan.id === "yearly" && (
                        <View style={styles.discountBadge}>
                          <Text style={styles.discountText}>16% 할인</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <Text style={styles.planDescription}>{plan.description}</Text>
                  <View style={styles.checkmarkContainer}>
                    {selectedPlanId === plan.id && (
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color="#6200EE"
                      />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* 구독하기 버튼 */}
            <TouchableOpacity
              style={styles.subscribeButton}
              onPress={handleSubscribe}
            >
              <Text style={styles.subscribeButtonText}>구독하기</Text>
            </TouchableOpacity>

            <Text style={styles.disclaimer}>
              * 구독은 선택한 기간 동안 자동으로 갱신됩니다. 언제든지 설정에서
              구독을 취소할 수 있습니다.
            </Text>
          </>
        )}

        {/* 구독 취소 버튼 */}
        {subscriptionStatus.isPremium && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancelSubscription}
          >
            <Text style={styles.cancelButtonText}>구독 취소</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  scrollContent: {
    padding: 16,
  },
  statusCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 20,
    marginBottom: 16,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 8,
    color: "#333",
  },
  statusInfo: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  benefitsCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  benefitText: {
    fontSize: 16,
    marginLeft: 12,
    color: "#333",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 16,
    color: "#333",
  },
  plansContainer: {
    marginBottom: 20,
  },
  planCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  selectedPlanCard: {
    borderColor: "#6200EE",
    borderWidth: 2,
  },
  planHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  planName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  priceContainer: {
    flexDirection: "column",
    alignItems: "flex-end",
  },
  planPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#6200EE",
  },
  discountBadge: {
    backgroundColor: "#6200EE",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 4,
  },
  discountText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  planDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  checkmarkContainer: {
    position: "absolute",
    top: 16,
    right: 16,
  },
  subscribeButton: {
    backgroundColor: "#6200EE",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginVertical: 16,
  },
  subscribeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  disclaimer: {
    fontSize: 12,
    color: "#999",
    marginBottom: 16,
    textAlign: "center",
  },
  cancelButton: {
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e53935",
    padding: 16,
    alignItems: "center",
    marginTop: 16,
  },
  cancelButtonText: {
    color: "#e53935",
    fontSize: 16,
    fontWeight: "bold",
  },
});
