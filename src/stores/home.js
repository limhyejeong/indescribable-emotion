import { defineStore } from 'pinia'
import emoColRef from "@/firebase";
import { getDocs, doc, deleteDoc, orderBy, query, where, limit } from "firebase/firestore";


export const useHomeStore = defineStore('home', {
    state: () => ({
        emotions: [],
        isDelete: false,
    }),
    getters: {

    },
    actions: {
        // 데이터 불러오기
        fetchEmotions() {
            // let emotionsSnapshot = getDocs(emoColRef);
            let q = query(emoColRef, orderBy("time", "desc"), limit(300));
            let emotionsSnapshot = getDocs(q);
            let emotions = [];

            emotionsSnapshot.then((emotionsSnap) => {
                emotionsSnap.forEach((emotion) => {
                    let emotionData = emotion.data();
                    emotionData.id = emotion.id;
                    emotions.push(emotionData);
                });

                this.emotions = emotions;
            });
        },

        // 데이터 삭제
        deleteEmotion(checkPassword, emotionPassword, emotionId) {
            if (checkPassword == emotionPassword) {
                let emoRef = doc(emoColRef, emotionId);
                deleteDoc(emoRef).then(() => {
                    alert("감정이 삭제되었습니다");
                    window.location.reload();
                    this.isDelete = false;

                });
            } else {
                alert("암호가 맞지 않습니다.");
            }
        },
    },
})
